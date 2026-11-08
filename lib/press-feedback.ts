// Pure pieces of the press feedback (MO1): which element a pointer pressed, where
// its fill ripple starts and how big it grows, and how long a short tap is held
// so the sink always shows. Runtime-agnostic, so it is unit-tested without a DOM.

export const PRESSABLE = ".hm-btn, .hm-chip, .hm-press";

// A tap is held pressed at least this long, so a quick tap still sinks fully.
export const MIN_PRESS_MS = 180;

// A touch waits this long before pressing, so a swipe that starts on a button
// (scrolling the page or a chip row) never flashes it.
export const TOUCH_PRESS_DELAY_MS = 70;

// A touch that moves further than this before it presses is a scroll, not a tap.
export const TOUCH_SLOP_PX = 8;

export type Rect = { left: number; top: number; width: number; height: number };

// The ripple is a circle centred on the press point whose radius reaches the
// farthest corner, so at full size it covers the whole control.
export function rippleGeometry(rect: Rect, clientX: number, clientY: number) {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  const dx = Math.max(x, rect.width - x);
  const dy = Math.max(y, rect.height - y);
  return { x, y, r: Math.ceil(Math.hypot(dx, dy)) };
}

// Keyboard and pointer-less clicks press from the centre.
export function centreGeometry(rect: Rect) {
  return rippleGeometry(rect, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

export function releaseDelay(pressedForMs: number) {
  return Math.max(0, MIN_PRESS_MS - pressedForMs);
}

// A fill with no colour (an outline control) has nothing to grow, so the circle
// falls back to a light wash of the text colour (the CSS default).
export function isTransparentColor(color: string) {
  const c = color.trim().toLowerCase();
  if (c === "" || c === "transparent") return true;
  const slash = c.match(/\/\s*([\d.]+%?)\s*\)$/);
  if (slash) return parseFloat(slash[1]) === 0;
  const rgba = c.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/);
  return rgba ? parseFloat(rgba[1]) === 0 : false;
}

export function movedTooFar(dx: number, dy: number) {
  return Math.hypot(dx, dy) > TOUCH_SLOP_PX;
}
