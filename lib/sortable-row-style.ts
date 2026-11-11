import type { CSSProperties } from "react";

// Reel 04, "Lift, then make room" (MO4). The dragged row lifts to 105% with a
// slight tilt; on drop it settles back, dipping once just under 100%.
export const SORTABLE_LIFT_SCALE = 1.05;
export const SORTABLE_LIFT_TILT = "0.8deg";
export const SORTABLE_SLIDE_MS = 200;
export const SORTABLE_SETTLE_MS = 300;
export const SORTABLE_EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const SETTLE_CURVE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const LIFT = `scale ${SORTABLE_SLIDE_MS}ms ${SORTABLE_EASE_OUT}, rotate ${SORTABLE_SLIDE_MS}ms ${SORTABLE_EASE_OUT}`;

// The settle is played with element.animate(), not a CSS transition: on drop React
// moves the row's node to its new place, and a moved node loses its transitions.
// z-index stays up for the length of the settle, so the row lands on top.
export const SORTABLE_SETTLE_KEYFRAMES: Keyframe[] = [
  { scale: SORTABLE_LIFT_SCALE, rotate: SORTABLE_LIFT_TILT, zIndex: 1 },
  { scale: 1, rotate: "0deg", zIndex: 1 },
];
export const SORTABLE_SETTLE_TIMING: KeyframeAnimationOptions = { duration: SORTABLE_SETTLE_MS, easing: SETTLE_CURVE };

export type SortableRowState = {
  transform: string | undefined;
  /** dnd-kit's own `transform` transition, when it has one. */
  transition: string | undefined;
  isDragging: boolean;
  reduceMotion: boolean;
};

function joined(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(", ");
}

export function sortableRowStyle({ transform, transition, isDragging, reduceMotion }: SortableRowState): CSSProperties {
  const base: CSSProperties = { transform, position: "relative" };
  // The card's own surface, so rows underneath do not show through the lifted one.
  const raised: CSSProperties = isDragging ? { zIndex: 1, backgroundColor: "var(--card)" } : {};

  if (reduceMotion) return { ...base, ...raised, transition };

  if (isDragging) {
    return { ...base, ...raised, scale: SORTABLE_LIFT_SCALE, rotate: SORTABLE_LIFT_TILT, transition: joined(transition, LIFT) };
  }
  return { ...base, transition };
}
