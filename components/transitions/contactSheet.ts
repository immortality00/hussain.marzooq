export const CONTACT_SHEET_COLS = 8;
export const CONTACT_SHEET_ROWS = 5;
export const CONTACT_SHEET_CELLS = CONTACT_SHEET_COLS * CONTACT_SHEET_ROWS;

export const CONTACT_SHEET_CELL_MS = 460;
export const CONTACT_SHEET_STAGGER_MS = 440;
export const CONTACT_SHEET_IN_MS = CONTACT_SHEET_CELL_MS + CONTACT_SHEET_STAGGER_MS;
export const CONTACT_SHEET_OUT_MS = CONTACT_SHEET_CELL_MS + CONTACT_SHEET_STAGGER_MS;
export const CONTACT_SHEET_MAX_WAIT_MS = 2500;

export interface ContactSheetCell {
  index: number;
  image: string;
  inDelayMs: number;
  outDelayMs: number;
}

// Fills the grid with a gallery of the supplied photos — each cell a distinct
// image, cycled and shuffled across the cells so repeats don't sit adjacent.
export function buildContactSheetCells(
  images: string[],
  rng: () => number = Math.random,
): ContactSheetCell[] {
  const pool = images.length > 0 ? images : [""];
  const assigned: string[] = [];
  for (let i = 0; i < CONTACT_SHEET_CELLS; i += 1) {
    assigned.push(pool[i % pool.length]);
  }
  for (let i = assigned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [assigned[i], assigned[j]] = [assigned[j], assigned[i]];
  }
  return assigned.map((image, index) => ({
    index,
    image,
    inDelayMs: Math.round(rng() * CONTACT_SHEET_STAGGER_MS),
    outDelayMs: Math.round(rng() * CONTACT_SHEET_STAGGER_MS),
  }));
}
