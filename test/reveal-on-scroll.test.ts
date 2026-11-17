import { describe, expect, it } from "vitest";

import { REVEAL_AFTER_PX, isRevealed, isScrolledDown } from "@/hooks/useRevealOnScroll";

describe("isScrolledDown (Back to top)", () => {
  it("shows only once the page has scrolled past the threshold, short page or not", () => {
    expect(isScrolledDown(0)).toBe(false);
    expect(isScrolledDown(REVEAL_AFTER_PX)).toBe(false);
    expect(isScrolledDown(REVEAL_AFTER_PX + 1)).toBe(true);
  });
});

describe("isRevealed", () => {
  it("stays hidden at the top of a page that can scroll", () => {
    expect(isRevealed(0, 2000)).toBe(false);
    expect(isRevealed(REVEAL_AFTER_PX, 2000)).toBe(false);
  });

  it("shows once the page has scrolled past the threshold", () => {
    expect(isRevealed(REVEAL_AFTER_PX + 1, 2000)).toBe(true);
  });

  it("shows at once on a page too short to scroll past the threshold", () => {
    expect(isRevealed(0, 0)).toBe(true);
    expect(isRevealed(0, REVEAL_AFTER_PX)).toBe(true);
    expect(isRevealed(0, REVEAL_AFTER_PX + 1)).toBe(false);
  });
});
