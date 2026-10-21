import { describe, expect, test } from "vitest";
import { clampFocus, heroFocusOf, heroFocusVars, isBadHeroFocus } from "@/lib/hero-focus";

describe("heroFocusOf", () => {
  test("reads two percentages, rounded to a tenth", () => {
    expect(heroFocusOf({ x: 20, y: 75.04 })).toEqual({ x: 20, y: 75 });
    expect(heroFocusOf({ x: 0, y: 100 })).toEqual({ x: 0, y: 100 });
  });

  test("anything else is no focus", () => {
    for (const value of [undefined, null, "50,50", [50, 50], { x: 50 }, { x: "50", y: 50 }, { x: -1, y: 50 }, { x: 50, y: 101 }, { x: NaN, y: 1 }]) {
      expect(heroFocusOf(value)).toBeNull();
    }
  });
});

describe("isBadHeroFocus", () => {
  test("no focus at all is fine; a broken one is not", () => {
    expect(isBadHeroFocus(undefined)).toBe(false);
    expect(isBadHeroFocus(null)).toBe(false);
    expect(isBadHeroFocus({ x: 10, y: 90 })).toBe(false);
    expect(isBadHeroFocus({ x: 10 })).toBe(true);
    expect(isBadHeroFocus({ x: 10, y: 140 })).toBe(true);
  });
});

test("clampFocus keeps a dragged point on the photo", () => {
  expect(clampFocus(-12, 104.36)).toEqual({ x: 0, y: 100 });
  expect(clampFocus(33.333, 66.666)).toEqual({ x: 33.3, y: 66.7 });
});

test("heroFocusVars sets the two values the hero's CSS reads, and nothing for a centred photo", () => {
  expect(heroFocusVars({ x: 20, y: 30 })).toEqual({ "--focus-x": "20%", "--focus-y": "30%" });
  expect(heroFocusVars(undefined)).toBeUndefined();
});
