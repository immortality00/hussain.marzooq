import { useSyncExternalStore } from "react";

export const REVEAL_AFTER_PX = 40;

export function isRevealed(scrollY: number, scrollRoom: number) {
  return scrollY > REVEAL_AFTER_PX || scrollRoom <= REVEAL_AFTER_PX;
}

function subscribe(onChange: () => void) {
  const observer = new ResizeObserver(onChange);
  observer.observe(document.body);
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function snapshot() {
  return isRevealed(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
}

export function useRevealOnScroll() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

// Scrolled past the same 40px, with no "short page" exception: for controls that only make
// sense once the page has moved (Back to top).
export function isScrolledDown(scrollY: number) {
  return scrollY > REVEAL_AFTER_PX;
}

function scrolledDownSnapshot() {
  return isScrolledDown(window.scrollY);
}

export function useScrolledDown() {
  return useSyncExternalStore(subscribe, scrolledDownSnapshot, () => false);
}
