import { describe, expect, it } from "vitest";
import {
  CONTACT_SHEET_CELLS,
  CONTACT_SHEET_STAGGER_MS,
  buildContactSheetCells,
} from "@/components/transitions/contactSheet";

describe("buildContactSheetCells", () => {
  it("fills every grid cell", () => {
    const cells = buildContactSheetCells(["a.jpg", "b.jpg", "c.jpg"], () => 0);
    expect(cells).toHaveLength(CONTACT_SHEET_CELLS);
  });

  it("draws every cell image from the supplied gallery pool", () => {
    const pool = ["a.jpg", "b.jpg", "c.jpg", "d.jpg"];
    const cells = buildContactSheetCells(pool, () => 0.5);
    for (const cell of cells) {
      expect(pool).toContain(cell.image);
    }
    const used = new Set(cells.map((c) => c.image));
    expect(used.size).toBeGreaterThan(1);
  });

  it("tolerates an empty pool without throwing", () => {
    const cells = buildContactSheetCells([], () => 0);
    expect(cells).toHaveLength(CONTACT_SHEET_CELLS);
    expect(cells[0].image).toBe("");
  });

  it("keeps stagger delays within the stagger window", () => {
    const min = buildContactSheetCells(["a.jpg"], () => 0);
    const max = buildContactSheetCells(["a.jpg"], () => 1);
    for (const cell of min) {
      expect(cell.inDelayMs).toBe(0);
      expect(cell.outDelayMs).toBe(0);
    }
    for (const cell of max) {
      expect(cell.inDelayMs).toBe(CONTACT_SHEET_STAGGER_MS);
      expect(cell.outDelayMs).toBe(CONTACT_SHEET_STAGGER_MS);
    }
  });

  it("is deterministic for a fixed rng", () => {
    const a = buildContactSheetCells(["a.jpg", "b.jpg"], () => 0.25);
    const b = buildContactSheetCells(["a.jpg", "b.jpg"], () => 0.25);
    expect(a).toEqual(b);
  });
});
