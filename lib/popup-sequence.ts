/** Moving through the items of a popup (UX4): 1 is next, -1 previous. */
export type StepDirection = 1 | -1;

/** A swipe moves on when it travels a quarter of the photo, or flicks — never under this many px. */
export const SWIPE_MIN_PX = 24;
const SWIPE_SHARE = 0.25;
/** A flick: faster than this at release, in px per ms (Sonner's and Vaul's swipe threshold). */
export const FLICK_PX_PER_MS = 0.11;
/** The release speed is read over the last this many ms of the swipe. */
const VELOCITY_WINDOW_MS = 100;

export type SwipeSample = { x: number; t: number };

/** The samples a release speed is read from: the newest one and those at most 100 ms older. */
export function recentSamples(samples: SwipeSample[], next: SwipeSample): SwipeSample[] {
  return [...samples.filter((s) => next.t - s.t <= VELOCITY_WINDOW_MS), next];
}

/** px per ms over the samples kept, 0 when they span no time. */
export function releaseVelocity(samples: SwipeSample[]): number {
  if (samples.length < 2) return 0;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const time = last.t - first.t;
  return time > 0 ? (last.x - first.x) / time : 0;
}

/**
 * Where a released sideways swipe goes: a swipe to the left is next, to the right previous.
 * It moves on when it travelled far enough or was flicked that way, and only when there is
 * an item on that side; otherwise it goes back (null).
 */
export function swipeStep({
  dx,
  velocity,
  width,
  canPrevious,
  canNext,
}: {
  dx: number;
  velocity: number;
  width: number;
  canPrevious: boolean;
  canNext: boolean;
}): StepDirection | null {
  const direction: StepDirection = dx < 0 ? 1 : -1;
  if (direction === 1 ? !canNext : !canPrevious) return null;
  const distance = Math.abs(dx);
  if (distance < SWIPE_MIN_PX) return null;
  const far = distance >= width * SWIPE_SHARE;
  const flicked = Math.abs(velocity) > FLICK_PX_PER_MS && Math.sign(velocity) === Math.sign(dx);
  return far || flicked ? direction : null;
}

/** Elements that use ← and → themselves: a field moves its cursor, a video seeks. */
const OWN_ARROW_KEYS = "input, textarea, select, video, audio, [contenteditable]:not([contenteditable='false'])";

/**
 * The step an arrow key asks for, or null. Not with Cmd, Ctrl, Alt or Shift — Cmd/Alt + ←
 * is the browser's Back — and not while a field or a video has the keyboard.
 */
export function arrowStep(
  event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey" | "shiftKey" | "target">
): StepDirection | null {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : null;
  if (direction === null) return null;
  const target = event.target;
  if (typeof Element !== "undefined" && target instanceof Element && target.closest(OWN_ARROW_KEYS)) return null;
  return direction;
}
