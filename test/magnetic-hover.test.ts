import { describe, expect, it } from "vitest";
import { magneticOffset } from "@/hooks/useMagneticHover";

const REACH_X = 60;
const REACH_Y = 44;
const MAX_X = 12;
const MAX_Y = 8;

describe("magneticOffset", () => {
  it("returns zero when the cursor is outside the reach on either axis", () => {
    expect(magneticOffset(REACH_X, 0, REACH_X, REACH_Y, MAX_X, MAX_Y)).toEqual({ x: 0, y: 0 });
    expect(magneticOffset(0, REACH_Y, REACH_X, REACH_Y, MAX_X, MAX_Y)).toEqual({ x: 0, y: 0 });
  });

  it("returns zero at the exact center", () => {
    expect(magneticOffset(0, 0, REACH_X, REACH_Y, MAX_X, MAX_Y)).toEqual({ x: 0, y: 0 });
  });

  it("pulls toward the cursor, proportionally to distance", () => {
    const half = magneticOffset(REACH_X / 2, REACH_Y / 2, REACH_X, REACH_Y, MAX_X, MAX_Y);
    expect(half.x).toBeCloseTo(MAX_X / 2);
    expect(half.y).toBeCloseTo(MAX_Y / 2);
  });

  it("never exceeds the max offset on either axis", () => {
    const near = magneticOffset(REACH_X - 1, -(REACH_Y - 1), REACH_X, REACH_Y, MAX_X, MAX_Y);
    expect(Math.abs(near.x)).toBeLessThanOrEqual(MAX_X);
    expect(Math.abs(near.y)).toBeLessThanOrEqual(MAX_Y);
    expect(near.x).toBeGreaterThan(0);
    expect(near.y).toBeLessThan(0);
  });
});
