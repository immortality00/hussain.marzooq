// Pull to refresh in the Home Screen apps (MO5): the numbers and the maths, runtime-agnostic.

/** Reel 02, "Resist the pull": the page comes down 35% of the way the finger goes. */
export const PULL_RATIO = 0.35;
/** A release refreshes once the page has come down this far (the finger's 160 px). */
export const PULL_THRESHOLD_PX = 56;
/** The gap the page keeps open above itself while it refreshes. */
export const PULL_REST_PX = 56;
/** Until the finger has moved this far, it hasn't said which way it is going. */
export const PULL_SLOP_PX = 6;
/** Held this long before it moves, a touch is a long press (selecting text), not a pull. */
export const PULL_LONG_PRESS_MS = 450;

/** A release: the page goes back, or settles at the gap. */
export const PULL_SETTLE_MS = 200;
/** The page goes back once the refresh is done. */
export const PULL_RETURN_MS = 250;
/** The logo stays at least one sweep of its light (app/styles/pull-refresh.css). */
export const PULL_MIN_REFRESH_MS = 700;
/** …and never longer than this, whatever the network does. */
export const PULL_MAX_REFRESH_MS = 10_000;
/** A message in the gap stays this long before the page goes back. */
export const PULL_MESSAGE_MS = 2500;
/** MO3's curve: fast, then slow. */
export const PULL_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

export type PullDirection = "pending" | "pull" | "page";

/** Where a touch that started at the top is going: down is a pull, up and sideways are the page's. */
export function pullDirection(dx: number, dy: number): PullDirection {
  if (Math.abs(dx) < PULL_SLOP_PX && Math.abs(dy) < PULL_SLOP_PX) return "pending";
  return dy > Math.abs(dx) ? "pull" : "page";
}

/** How far the page has come down for a finger `dy` px below where it started. */
export function pullOffset(dy: number): number {
  return Math.max(0, dy) * PULL_RATIO;
}

/** How much of the signature is written: 0 at rest, 1 at the threshold. */
export function pullProgress(offset: number): number {
  return Math.min(1, Math.max(0, offset / PULL_THRESHOLD_PX));
}

/** Whether letting go at this offset refreshes. */
export function pullArmed(offset: number): boolean {
  return offset >= PULL_THRESHOLD_PX;
}

/** The logo's top: centred in the gap above the page (above the screen's edge at first). */
export function pullLogoTop(offset: number, logoHeight: number): number {
  return offset / 2 - logoHeight / 2;
}

/** The clip that writes the signature from left to right as the page comes down. */
export function pullWrittenClip(progress: number): string {
  const hidden = Math.round((1 - Math.min(1, Math.max(0, progress))) * 1000) / 10;
  return `inset(0 ${hidden}% 0 0)`;
}

/** A computed `touch-action` that still lets the browser pan up and down (so a pull may start there). */
export function allowsVerticalPan(touchAction: string): boolean {
  if (!touchAction || touchAction === "auto" || touchAction === "manipulation") return true;
  return /\bpan-(y|up|down)\b/.test(touchAction);
}
