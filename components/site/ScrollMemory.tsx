"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { currentHistoryEntry } from "@/lib/client/history-entry";
import { persistScroll, saveScroll, savedScroll } from "@/lib/client/scroll-positions";
import { restorePageScroll } from "@/lib/client/page-scroll";

// Puts a page back where the visitor left it on a return — the browser's Back or Forward,
// the site's Back button, a reload. The browser can't do it for this site: on Back it sets
// the position before the site has drawn the page (the site draws pages itself, a moment
// later), on the old page. So each history entry's position is recorded as the visitor
// scrolls and set again once the returning page is on screen. Browsers without the
// Navigation API keep their own behaviour.
function savedForCurrentEntry(): number | undefined {
  const key = currentHistoryEntry()?.key;
  return key ? savedScroll(key) : undefined;
}

export function ScrollMemory() {
  const pathname = usePathname();
  const shownPath = useRef(pathname);
  const pending = useRef<number | null>(null);

  useEffect(() => {
    if (!currentHistoryEntry()) return;
    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    // Recorded on every scroll, on every click (a link is pressed while its page is still
    // whole) and just before a Back/Forward — never on a frame, which a hidden tab doesn't draw.
    const record = () => {
      const key = currentHistoryEntry()?.key;
      if (key) saveScroll(key, window.scrollY);
    };
    const onNavigate = (event: NavigateEvent) => {
      if (event.navigationType === "traverse") record();
    };

    // An entry with no recorded position was never scrolled: its place is the top.
    const onPopState = () => {
      const y = savedForCurrentEntry() ?? 0;
      if (window.location.pathname === shownPath.current) restorePageScroll(y);
      else pending.current = y;
    };

    // A reload or a return from another site puts the remembered position back; any other
    // arrival records where the page already is (a visitor can scroll before the page has
    // finished loading, before any scroll is heard).
    const [arrival] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const saved = savedForCurrentEntry();
    if ((arrival?.type === "reload" || arrival?.type === "back_forward") && saved !== undefined) {
      restorePageScroll(saved);
    } else {
      const key = currentHistoryEntry()?.key;
      if (key) saveScroll(key, window.scrollY);
    }

    window.addEventListener("scroll", record, { passive: true });
    document.addEventListener("click", record, true);
    window.navigation.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", persistScroll);
    return () => {
      window.removeEventListener("scroll", record);
      document.removeEventListener("click", record, true);
      window.navigation.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", persistScroll);
      persistScroll();
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  // Runs after the returning page's own layout effects, so its content (a remembered
  // search and its results) is already on screen.
  useLayoutEffect(() => {
    shownPath.current = pathname;
    const y = pending.current;
    pending.current = null;
    if (y !== null) restorePageScroll(y);
  }, [pathname]);

  return null;
}
