import { describe, expect, it } from "vitest";
import {
  PULL_RATIO,
  PULL_THRESHOLD_PX,
  allowsVerticalPan,
  pullArmed,
  pullDirection,
  pullLogoTop,
  pullOffset,
  pullProgress,
  pullWrittenClip,
} from "@/lib/pull-refresh";

describe("the pull's direction", () => {
  it("waits until the finger has moved 6 px", () => {
    expect(pullDirection(0, 0)).toBe("pending");
    expect(pullDirection(5, 5)).toBe("pending");
    expect(pullDirection(-5, -5)).toBe("pending");
  });

  it("is a pull when it goes down more than sideways", () => {
    expect(pullDirection(0, 6)).toBe("pull");
    expect(pullDirection(5, 9)).toBe("pull");
    expect(pullDirection(-20, 21)).toBe("pull");
  });

  it("leaves up and sideways to the page (scrolling, a chip row, a wide table)", () => {
    expect(pullDirection(0, -6)).toBe("page");
    expect(pullDirection(10, 10)).toBe("page");
    expect(pullDirection(-30, 8)).toBe("page");
    expect(pullDirection(40, 0)).toBe("page");
  });
});

describe("how far the page comes down", () => {
  it("is reel 02's 35% of the finger, never above the top", () => {
    expect(PULL_RATIO).toBe(0.35);
    expect(pullOffset(100)).toBeCloseTo(35);
    expect(pullOffset(-40)).toBe(0);
  });

  it("is far enough at 56 px, the finger's 160", () => {
    expect(PULL_THRESHOLD_PX).toBe(56);
    expect(pullArmed(pullOffset(159))).toBe(false);
    expect(pullArmed(pullOffset(160))).toBe(true);
    expect(pullArmed(pullOffset(400))).toBe(true);
  });

  it("writes the signature in as it comes, whole at the threshold", () => {
    expect(pullProgress(0)).toBe(0);
    expect(pullProgress(28)).toBe(0.5);
    expect(pullProgress(56)).toBe(1);
    expect(pullProgress(90)).toBe(1);
    expect(pullWrittenClip(0)).toBe("inset(0 100% 0 0)");
    expect(pullWrittenClip(0.25)).toBe("inset(0 75% 0 0)");
    expect(pullWrittenClip(1)).toBe("inset(0 0% 0 0)");
    expect(pullWrittenClip(3)).toBe("inset(0 0% 0 0)");
  });

  it("keeps the logo centred in the gap", () => {
    expect(pullLogoTop(56, 32)).toBe(12);
    expect(pullLogoTop(0, 32)).toBe(-16);
  });
});

describe("where the browser keeps vertical panning", () => {
  it("lets a pull start where the page would scroll", () => {
    for (const value of ["", "auto", "manipulation", "pan-y", "pan-x pan-y", "pan-y pinch-zoom", "pan-down"]) {
      expect(allowsVerticalPan(value)).toBe(true);
    }
  });

  it("never on something that handles its own drag", () => {
    for (const value of ["none", "pan-x", "pinch-zoom", "pan-x pinch-zoom", "pan-left"]) {
      expect(allowsVerticalPan(value)).toBe(false);
    }
  });
});
