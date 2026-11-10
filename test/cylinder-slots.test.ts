import { describe, expect, it } from "vitest";
import { frontPosition, isExtension, photoIndex, slotPlace } from "@/lib/cylinder-slots";

const SLOTS = 30;
const SPACING = (2 * Math.PI) / SLOTS;

function shown(rotation: number, count: number) {
  const front = frontPosition(rotation, SLOTS, SPACING);
  return Array.from({ length: SLOTS }, (_, slot) => photoIndex(slotPlace(slot, SLOTS, front), count));
}

describe("cylinder slots", () => {
  it("starts with the first photos in their slots, as before", () => {
    expect(shown(0, 252)).toEqual(Array.from({ length: SLOTS }, (_, i) => i));
  });

  it("brings later photos round as the ring turns, and every photo reaches the front", () => {
    const seen = new Set<number>();
    for (let step = 0; step <= 252; step++) {
      const rotation = -(step + 0.25) * SPACING; // the idle spin turns the ring this way; off the halfway ties
      const front = Math.round(frontPosition(rotation, SLOTS, SPACING));
      seen.add(photoIndex(slotPlace(((front % SLOTS) + SLOTS) % SLOTS, SLOTS, front), 252));
    }
    expect(seen.size).toBe(252);
  });

  it("changes a slot's photo only when it is opposite the front", () => {
    const front = 15 - 0.01; // slot 0 sits at the front at 0, so at the back at 15
    const before = slotPlace(0, SLOTS, front);
    const after = slotPlace(0, SLOTS, front + 0.02);
    expect(after - before).toBe(SLOTS);
    // The slots near the front keep their photo across that moment.
    expect(slotPlace(29, SLOTS, front)).toBe(slotPlace(29, SLOTS, front + 0.02));
  });

  it("dragging back shows the photos already passed", () => {
    // Turned back by 3: the three slots that were at the back now show the last three photos.
    expect(shown(SPACING * 3, 252).slice(27)).toEqual([249, 250, 251]);
    expect(shown(SPACING * 3, 252).slice(0, 27)).toEqual(Array.from({ length: 27 }, (_, i) => i));
  });

  it("repeats the line after the last photo", () => {
    expect(photoIndex(252, 252)).toBe(0);
    expect(photoIndex(-1, 252)).toBe(251);
  });

  it("knows when a list only grew", () => {
    expect(isExtension(["a", "b"], ["a", "b", "c"])).toBe(true);
    expect(isExtension(["a", "b"], ["a", "b"])).toBe(true);
    expect(isExtension(["a", "b"], ["b", "c", "d"])).toBe(false);
    expect(isExtension(["a", "b"], ["a"])).toBe(false);
  });
});
