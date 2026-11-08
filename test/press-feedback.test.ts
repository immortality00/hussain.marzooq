import { describe, expect, it } from "vitest";
import {
  MIN_PRESS_MS,
  centreGeometry,
  isTransparentColor,
  movedTooFar,
  releaseDelay,
  rippleGeometry,
} from "@/lib/press-feedback";

const rect = { left: 100, top: 50, width: 200, height: 40 };

describe("rippleGeometry", () => {
  it("centres on the press point and reaches the farthest corner", () => {
    expect(rippleGeometry(rect, 110, 60)).toEqual({ x: 10, y: 10, r: Math.ceil(Math.hypot(190, 30)) });
  });

  it("clamps a point outside the control to its edge", () => {
    expect(rippleGeometry(rect, 0, 500)).toMatchObject({ x: 0, y: 40 });
  });

  it("presses from the centre for the keyboard", () => {
    expect(centreGeometry(rect)).toEqual({ x: 100, y: 20, r: Math.ceil(Math.hypot(100, 20)) });
  });
});

describe("releaseDelay", () => {
  it("holds a quick tap until the minimum press time", () => {
    expect(releaseDelay(30)).toBe(MIN_PRESS_MS - 30);
    expect(releaseDelay(MIN_PRESS_MS + 50)).toBe(0);
  });
});

describe("movedTooFar", () => {
  it("treats a small wobble as a tap and a swipe as a scroll", () => {
    expect(movedTooFar(3, 4)).toBe(false);
    expect(movedTooFar(0, 20)).toBe(true);
  });
});

describe("isTransparentColor", () => {
  it.each([
    ["transparent", true],
    ["rgba(0, 0, 0, 0)", true],
    ["oklch(0.98 0 0 / 0)", true],
    ["rgb(255, 255, 255)", false],
    ["rgba(255, 255, 255, 0.9)", false],
    ["oklch(0.98 0 0 / 0.9)", false],
    ["oklch(0.98 0 0)", false],
  ])("%s → %s", (color, expected) => {
    expect(isTransparentColor(color)).toBe(expected);
  });
});
