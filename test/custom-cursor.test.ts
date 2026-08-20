import { describe, it, expect } from "vitest";
import { stretchFor, stepSpring } from "@/components/site/CustomCursor";

describe("stretchFor", () => {
  it("returns a circle at rest", () => {
    expect(stretchFor(0)).toEqual({ sx: 1, sy: 1 });
  });

  it("stretches along X and squashes Y as speed rises", () => {
    const s = stretchFor(1000);
    expect(s.sx).toBeGreaterThan(1);
    expect(s.sy).toBeLessThan(1);
  });

  it("clamps at the max speed", () => {
    expect(stretchFor(1e6)).toEqual(stretchFor(42));
  });

  it("never squashes Y below zero", () => {
    expect(stretchFor(1e6).sy).toBeGreaterThan(0);
  });
});

describe("stepSpring", () => {
  it("moves toward the target without teleporting", () => {
    const next = stepSpring(0, 0, 100);
    expect(next.pos).toBeGreaterThan(0);
    expect(next.pos).toBeLessThan(100);
  });

  it("overshoots then settles (underdamped)", () => {
    let pos = 0;
    let vel = 0;
    let maxPos = 0;
    for (let i = 0; i < 400; i++) {
      ({ pos, vel } = stepSpring(pos, vel, 100));
      maxPos = Math.max(maxPos, pos);
    }
    expect(maxPos).toBeGreaterThan(100);
    expect(Math.abs(pos - 100)).toBeLessThan(0.5);
  });
});
