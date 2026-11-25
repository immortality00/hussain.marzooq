// The geometry of a page's title (and a detail page's Back and photo) flying into its title bar
// and back (components/shared/title-bar/, UX1b). Pure, so it is unit-tested.

export type Rect = { left: number; top: number; width: number; height: number };

/** Where a stand-in is drawn: its centre, and its scale against the page's own size (1). */
export type Pose = { x: number; y: number; s: number };

/** Into the bar, and back into the page. */
export const TO_BAR_MS = 350;
export const TO_PAGE_MS = 300;
/** The bar's own Back, photo and name taking over from the landed copies. */
export const HANDOVER_MS = 150;

export function centreOf(rect: Rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function poseOf(rect: Rect, s = 1): Pose {
  return { ...centreOf(rect), s };
}

export function mixPose(from: Pose, to: Pose, t: number): Pose {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    s: from.s + (to.s - from.s) * t,
  };
}

/** Draws a stand-in laid out at scale 1 around `base` at `pose` (transform-origin: centre). */
export function poseTransform(base: { x: number; y: number }, pose: Pose) {
  return `translate(${pose.x - base.x}px, ${pose.y - base.y}px) scale(${pose.s})`;
}

export function onScreen(rect: Rect, viewportHeight: number) {
  return rect.top + rect.height > 0 && rect.top < viewportHeight;
}

/** CSS's cubic-bezier(x1, y1, x2, y2) as a function of progress 0–1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const xAt = (u: number) => ((ax * u + bx) * u + cx) * u;
  const yAt = (u: number) => ((ay * u + by) * u + cy) * u;
  const slopeAt = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  // The curve parameter whose x is `x`: Newton's method, then halving if it stalls.
  function solve(x: number) {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const error = xAt(u) - x;
      if (Math.abs(error) < 1e-7) return u;
      const slope = slopeAt(u);
      if (Math.abs(slope) < 1e-6) break;
      u -= error / slope;
    }
    let low = 0;
    let high = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const value = xAt(u);
      if (Math.abs(value - x) < 1e-7) break;
      if (value < x) low = u;
      else high = u;
      u = (low + high) / 2;
    }
    return u;
  }

  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : yAt(solve(t)));
}

/** MO3's curve for a card growing into its popup: fast, then slow. */
export const FLIGHT_EASE = cubicBezier(0.23, 1, 0.32, 1);
