"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ContactSheetTransition } from "./ContactSheetTransition";
import type { ContactSheetState, TransitionPhase } from "./ContactSheetTransition";
import {
  buildContactSheetCells,
  CONTACT_SHEET_IN_MS,
  CONTACT_SHEET_MAX_WAIT_MS,
  CONTACT_SHEET_OUT_MS,
} from "./contactSheet";

const REDUCED_MS = 300;

interface PageTransition {
  navigate: (href: string, imageUrl?: string) => void;
}

const TransitionCtx = createContext<PageTransition | null>(null);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hrefToPath(href: string): string {
  const q = href.search(/[?#]/);
  return q === -1 ? href : href.slice(0, q);
}

// Gathers the photos currently on the page (Featured Work, hero, previews) so the
// grid reads as a gallery of the real work rather than one repeated image.
function collectImagePool(first: string): string[] {
  const pool: string[] = [];
  if (first) pool.push(first);
  if (typeof document !== "undefined") {
    for (const img of document.querySelectorAll<HTMLImageElement>("main img")) {
      const src = img.currentSrc || img.src;
      if (src && !src.startsWith("data:")) pool.push(src);
    }
  }
  return Array.from(new Set(pool));
}

export function TransitionProvider({
  children,
  images,
}: {
  children: React.ReactNode;
  images?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ContactSheetState | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>("in");
  const [reduced, setReduced] = useState(false);

  const playing = useRef(false);
  const inDone = useRef(false);
  const committed = useRef(false);
  const pendingPath = useRef<string | null>(null);
  const outStarted = useRef(false);

  // Clears the cells only once they have finished assembling AND the destination
  // route has actually committed — otherwise the cells clear over the still-mounted
  // origin page and it flashes back before the target paints.
  const startOut = useCallback(() => {
    if (outStarted.current) return;
    if (!inDone.current || !committed.current) return;
    outStarted.current = true;
    setPhase("out");
    window.setTimeout(() => {
      setState(null);
      playing.current = false;
    }, CONTACT_SHEET_OUT_MS);
  }, []);

  useEffect(() => {
    if (!playing.current || !pendingPath.current || pathname !== pendingPath.current) return;
    committed.current = true;
    pendingPath.current = null;
    const id = window.setTimeout(startOut, 0);
    return () => window.clearTimeout(id);
  }, [pathname, startOut]);

  const navigate = useCallback(
    (href: string, imageUrl?: string) => {
      if (playing.current) return;

      const path = hrefToPath(href);
      // One consistent gallery pool for every page so the transition reads the
      // same everywhere; fall back to the current page's photos only if the
      // server pool is empty. Skip when there's no material or we're already here.
      const rawPool = images && images.length > 0 ? images : collectImagePool(imageUrl ?? "");
      const pool = Array.from(new Set(rawPool.filter(Boolean)));
      if (path === pathname || pool.length === 0) {
        router.push(href);
        return;
      }

      playing.current = true;

      if (prefersReducedMotion() || pool.length < 2) {
        setReduced(true);
        window.setTimeout(() => router.push(href), REDUCED_MS / 2);
        window.setTimeout(() => {
          setReduced(false);
          playing.current = false;
        }, REDUCED_MS);
        return;
      }

      inDone.current = false;
      committed.current = false;
      outStarted.current = false;
      pendingPath.current = path;

      setState({ cells: buildContactSheetCells(pool) });
      setPhase("in");
      router.push(href);

      window.setTimeout(() => {
        inDone.current = true;
        startOut();
      }, CONTACT_SHEET_IN_MS);

      // Safety cap: if the route never commits (redirect, error), clear anyway.
      window.setTimeout(() => {
        committed.current = true;
        pendingPath.current = null;
        inDone.current = true;
        startOut();
      }, CONTACT_SHEET_IN_MS + CONTACT_SHEET_MAX_WAIT_MS);
    },
    [images, pathname, router, startOut],
  );

  // Site-wide trigger: intercept every same-origin internal link click (capture
  // phase, before Next's Link handler) so the gallery transition plays on any
  // page-to-page navigation. Opt a link out with data-no-transition.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.dataset.noTransition !== undefined) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.getAttribute("rel")?.includes("external")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/admin")) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <ContactSheetTransition state={state} phase={phase} reduced={reduced} />
    </TransitionCtx.Provider>
  );
}

export function usePageTransition(): PageTransition | null {
  return useContext(TransitionCtx);
}
