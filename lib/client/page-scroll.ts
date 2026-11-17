import type Lenis from "lenis";

// Page scrolling that keeps Lenis (the site's smooth scroll) in step.
const RESTORE_FOR_MS = 2000;
const STOP_ON = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

let stopRestoring: (() => void) | null = null;

function smoothScroll(): Lenis | undefined {
  return (window as unknown as { lenis?: Lenis }).lenis;
}

// Straight to a position. Lenis measures the page again first, so a page that has just
// changed length is not cut short at the old length.
export function jumpPageTo(y: number): void {
  const lenis = smoothScroll();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(y, { immediate: true, force: true });
    return;
  }
  window.scrollTo(0, y);
}

// Puts a remembered position back. A page still drawing its content can be too short at
// first, so the position is set again as the page grows — until it is reached, the visitor
// scrolls, or 2 s pass.
export function restorePageScroll(y: number): void {
  stopRestoring?.();
  jumpPageTo(y);
  if (Math.abs(window.scrollY - y) <= 1) return;

  const observer = new ResizeObserver(() => {
    jumpPageTo(y);
    if (Math.abs(window.scrollY - y) <= 1) stop();
  });
  const timer = window.setTimeout(() => stop(), RESTORE_FOR_MS);
  function stop() {
    observer.disconnect();
    window.clearTimeout(timer);
    for (const type of STOP_ON) window.removeEventListener(type, stop);
    if (stopRestoring === stop) stopRestoring = null;
  }
  observer.observe(document.body);
  for (const type of STOP_ON) window.addEventListener(type, stop, { passive: true });
  stopRestoring = stop;
}

// Back to top: Lenis's glide, or the browser's smooth scroll; instant under reduced motion.
export function scrollPageToTop(reduced: boolean): void {
  stopRestoring?.();
  const lenis = smoothScroll();
  if (lenis) {
    lenis.scrollTo(0, { immediate: reduced, force: true });
    return;
  }
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}
