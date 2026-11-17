// Where a sideways chip row should scroll so the given chip sits in its middle — or null when
// the chip is already fully in view. Positions are on-screen boxes (getBoundingClientRect).
export function scrollLeftToCentre(
  row: { left: number; width: number; scrollLeft: number },
  chip: { left: number; width: number },
): number | null {
  const offset = chip.left - row.left;
  if (offset >= 0 && offset + chip.width <= row.width) return null;
  return Math.max(0, row.scrollLeft + offset - (row.width - chip.width) / 2);
}
