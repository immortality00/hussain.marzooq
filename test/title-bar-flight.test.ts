import { describe, expect, it } from "vitest";
import {
  FLIGHT_EASE,
  centreOf,
  cubicBezier,
  mixPose,
  onScreen,
  poseOf,
  poseTransform,
} from "@/lib/title-bar-flight";

// The curve's own definition, solved by brute force: the y of the point whose x is closest.
function reference(x1: number, y1: number, x2: number, y2: number, x: number) {
  let best = { gap: Infinity, y: 0 };
  for (let i = 0; i <= 20000; i++) {
    const u = i / 20000;
    const bx = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3;
    const by = 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
    const gap = Math.abs(bx - x);
    if (gap < best.gap) best = { gap, y: by };
  }
  return best.y;
}

describe("cubicBezier", () => {
  it("starts at 0, ends at 1 and matches CSS's curve in between", () => {
    const curves: [number, number, number, number][] = [
      [0.23, 1, 0.32, 1],
      [0.2, 0.7, 0.2, 1],
      [0.77, 0, 0.175, 1],
      [0.42, 0, 0.58, 1],
    ];
    for (const [x1, y1, x2, y2] of curves) {
      const ease = cubicBezier(x1, y1, x2, y2);
      expect(ease(0)).toBe(0);
      expect(ease(1)).toBe(1);
      for (const x of [0.05, 0.1, 0.25, 0.5, 0.75, 0.9]) {
        expect(ease(x)).toBeCloseTo(reference(x1, y1, x2, y2, x), 3);
      }
    }
  });

  it("is the identity for a straight line and clamps outside 0–1", () => {
    const linear = cubicBezier(0, 0, 1, 1);
    expect(linear(0.37)).toBeCloseTo(0.37, 6);
    expect(linear(-1)).toBe(0);
    expect(linear(2)).toBe(1);
  });

  it("is fast, then slow: most of the flight is done in its first third", () => {
    expect(FLIGHT_EASE(1 / 3)).toBeGreaterThan(0.8);
    let previous = 0;
    for (let i = 1; i <= 100; i++) {
      const value = FLIGHT_EASE(i / 100);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("poses", () => {
  const page = { left: 568, top: 63, width: 144, height: 144 };
  const bar = { left: 559, top: 69, width: 32, height: 32 };

  it("is a box's centre and scale", () => {
    expect(centreOf(page)).toEqual({ x: 640, y: 135 });
    expect(poseOf(bar, 0.25)).toEqual({ x: 575, y: 85, s: 0.25 });
    expect(poseOf(page)).toEqual({ x: 640, y: 135, s: 1 });
  });

  it("goes in a straight line from one pose to the other", () => {
    const from = poseOf(page);
    const to = poseOf(bar, 32 / 144);
    expect(mixPose(from, to, 0)).toEqual(from);
    expect(mixPose(from, to, 1)).toEqual(to);
    const half = mixPose(from, to, 0.5);
    expect(half.x).toBeCloseTo(607.5);
    expect(half.y).toBeCloseTo(110);
    expect(half.s).toBeCloseTo((1 + 32 / 144) / 2);
  });

  it("draws a stand-in laid out around its base at a pose", () => {
    expect(poseTransform({ x: 640, y: 135 }, { x: 640, y: 135, s: 1 })).toBe("translate(0px, 0px) scale(1)");
    expect(poseTransform({ x: 640, y: 135 }, { x: 575, y: 85, s: 0.25 })).toBe(
      "translate(-65px, -50px) scale(0.25)",
    );
  });
});

describe("onScreen", () => {
  it("is true while any of the box is inside the window's height", () => {
    expect(onScreen({ left: 0, top: -10, width: 10, height: 20 }, 800)).toBe(true);
    expect(onScreen({ left: 0, top: 790, width: 10, height: 20 }, 800)).toBe(true);
    expect(onScreen({ left: 0, top: -1300, width: 10, height: 40 }, 800)).toBe(false);
    expect(onScreen({ left: 0, top: 800, width: 10, height: 40 }, 800)).toBe(false);
  });
});
