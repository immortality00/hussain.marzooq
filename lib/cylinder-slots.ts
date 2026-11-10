/**
 * The Cylinder as a conveyor (2026-11-10). It keeps a fixed ring of `slots`
 * (30 on desktop, 16 on phones) however many photos there are; each slot shows
 * the photo whose place in the line is nearest the front for that slot. A slot
 * changes photo only when it is exactly opposite the front — out of sight — so
 * every photo passes the front in turn and the ring never grows or flattens.
 */

/** Which place in the line sits at the front for a ring turned by `rotation`. */
export function frontPosition(rotation: number, slots: number, spacing: number): number {
  return (slots - 1) / 2 - rotation / spacing;
}

/** The place in the line slot `slot` shows: the one in its lane nearest `front`. */
export function slotPlace(slot: number, slots: number, front: number): number {
  return slot + slots * Math.round((front - slot) / slots);
}

/** The photo index for a place in the line; the line repeats after `count` photos. */
export function photoIndex(place: number, count: number): number {
  return ((place % count) + count) % count;
}

/** True when `next` is `previous` with photos added at the end — the line only grew. */
export function isExtension(previous: readonly string[], next: readonly string[]): boolean {
  if (next.length < previous.length) return false;
  return previous.every((id, i) => next[i] === id);
}
