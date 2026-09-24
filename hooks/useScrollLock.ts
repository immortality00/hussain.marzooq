"use client";

import { useEffect } from "react";

let lockDepth = 0;
let savedOverflow = "";

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const lenis = (window as unknown as { lenis?: { stop(): void; start(): void } }).lenis;
    const html = document.documentElement;

    if (lockDepth === 0) {
      savedOverflow = html.style.overflow;
      lenis?.stop();
      html.style.overflow = "hidden";
    }
    lockDepth += 1;

    return () => {
      lockDepth -= 1;
      if (lockDepth > 0) return;
      html.style.overflow = savedOverflow;
      lenis?.start();
    };
  }, [active]);
}
