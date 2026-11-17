import { describe, expect, it } from "vitest";
import { scrollLeftToCentre } from "@/lib/chip-scroll";

const row = { left: 16, width: 343, scrollLeft: 0 };

describe("scrollLeftToCentre", () => {
  it("leaves a chip that is already fully in view", () => {
    expect(scrollLeftToCentre(row, { left: 40, width: 80 })).toBeNull();
    expect(scrollLeftToCentre(row, { left: 16 + 343 - 80, width: 80 })).toBeNull();
  });

  it("brings a chip past the right edge to the middle of the row", () => {
    // The measured case: the current chip at x 676–770 in a row starting at 16 on a 375px screen.
    const chip = { left: 676, width: 94 };
    const target = scrollLeftToCentre(row, chip);
    expect(target).toBe(676 - 16 - (343 - 94) / 2);
    const leftAfter = chip.left - (target ?? 0);
    expect(leftAfter - row.left + chip.width / 2).toBeCloseTo(row.width / 2);
  });

  it("brings back a chip cut off at the left edge, never past the start", () => {
    const scrolled = { left: 16, width: 343, scrollLeft: 300 };
    expect(scrollLeftToCentre(scrolled, { left: -20, width: 60 })).toBe(300 - 36 - (343 - 60) / 2);
    expect(scrollLeftToCentre({ ...scrolled, scrollLeft: 10 }, { left: 0, width: 60 })).toBe(0);
  });
});
