"use client";

import { useEffect } from "react";

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const lenis = (window as unknown as { lenis?: { stop(): void; start(): void } }).lenis;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;

    lenis?.stop();
    html.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [active]);
}
