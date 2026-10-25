"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ADMIN_STICKY_OFFSET_VAR, STICKY_OFFSET_EVENT } from "@/lib/sticky-toolbar";

const REGION_ID = "admin-sticky-region";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AdminStickyRegion() {
  const ref = useRef<HTMLDivElement | null>(null);

  // Publishes how much of the top of the screen the messages and bulk bar cover,
  // so a stuck search/filter bar (StickyToolbar) sits under them, not behind them.
  useEffect(() => {
    const region = ref.current;
    if (!region) return;
    const root = document.documentElement;

    const publish = () => {
      const covered = region.childElementCount ? Math.ceil(region.getBoundingClientRect().bottom) : 0;
      if (root.style.getPropertyValue(ADMIN_STICKY_OFFSET_VAR) === `${covered}px`) return;
      root.style.setProperty(ADMIN_STICKY_OFFSET_VAR, `${covered}px`);
      window.dispatchEvent(new Event(STICKY_OFFSET_EVENT));
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(region);
    return () => {
      observer.disconnect();
      root.style.removeProperty(ADMIN_STICKY_OFFSET_VAR);
    };
  }, []);

  return (
    <div
      ref={ref}
      id={REGION_ID}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col items-center gap-2 px-2 pt-2 md:px-4 md:pt-4"
    />
  );
}

export function AdminStickyPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;

  const region = document.getElementById(REGION_ID);
  if (!region) return null;

  return createPortal(
    <div className="pointer-events-auto w-full max-w-6xl">{children}</div>,
    region
  );
}
