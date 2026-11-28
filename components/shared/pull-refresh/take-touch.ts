// When the browser scrolls, it tells the page the touch is over (pointercancel) and sends it nothing more.
// A pull stops the scroll, so it does the same itself: the page's own touch handling (the hero's tap, a
// press, the Scroll view's drag) ends instead of acting on a finger that is pulling.

type TouchPointer = { id: number; target: EventTarget | null };

const SWALLOWED = ["pointermove", "pointerup", "pointercancel"] as const;
/** Past the touch's end, in case the browser sends pointerup after touchend. */
const RELEASE_AFTER_MS = 400;

let latest: TouchPointer | null = null;

function noteTouchPointer(event: PointerEvent) {
  if (event.pointerType === "touch" && event.isPrimary) latest = { id: event.pointerId, target: event.target };
}

/** Starts noting the finger's pointer, so a pull can take it; returns the stop. */
export function watchTouchPointers() {
  window.addEventListener("pointerdown", noteTouchPointer, { capture: true, passive: true });
  return () => window.removeEventListener("pointerdown", noteTouchPointer, { capture: true });
}

/** Takes the current finger away from the page; returns the release, called when the touch ends. */
export function takeTouch(): () => void {
  const pointer = latest;
  if (!pointer) return () => {};
  pointer.target?.dispatchEvent(
    new PointerEvent("pointercancel", { pointerId: pointer.id, pointerType: "touch", isPrimary: true, bubbles: true, composed: true })
  );

  const swallow = (event: PointerEvent) => {
    if (event.pointerId === pointer.id) event.stopImmediatePropagation();
  };
  for (const type of SWALLOWED) window.addEventListener(type, swallow, true);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    window.setTimeout(() => {
      for (const type of SWALLOWED) window.removeEventListener(type, swallow, true);
    }, RELEASE_AFTER_MS);
  };
}
