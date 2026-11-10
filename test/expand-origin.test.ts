import { describe, expect, it } from "vitest";
import {
  containBox,
  ghostFrames,
  isOnScreen,
  originWithin,
  rememberOrigin,
  takeOrigin,
  uniformRadii,
  type ExpandOrigin,
} from "@/lib/client/expand-origin";

const origin: ExpandOrigin = {
  box: { left: 10, top: 20, width: 100, height: 75 },
  src: "https://res.cloudinary.com/demo/image/upload/w_640,q_auto,f_auto/a.jpg",
  ratio: 1.5,
  radii: uniformRadii(16),
  element: null,
};

describe("origin record", () => {
  it("is taken once", () => {
    rememberOrigin(origin);
    expect(takeOrigin()).toBe(origin);
    expect(takeOrigin()).toBeNull();
  });

  it("is ignored when older than a second", () => {
    rememberOrigin(origin);
    expect(takeOrigin(Date.now() + 1500)).toBeNull();
  });
});

describe("containBox", () => {
  it("fits a wide photo to the width, centred", () => {
    expect(containBox({ left: 0, top: 0, width: 400, height: 400 }, 2)).toEqual({
      left: 0,
      top: 100,
      width: 400,
      height: 200,
    });
  });

  it("fits a tall photo to the height, centred", () => {
    expect(containBox({ left: 0, top: 0, width: 400, height: 400 }, 0.5)).toEqual({
      left: 100,
      top: 0,
      width: 200,
      height: 400,
    });
  });

  it("leaves the box alone for an unknown ratio", () => {
    const box = { left: 1, top: 2, width: 3, height: 4 };
    expect(containBox(box, 0)).toBe(box);
  });
});

describe("ghostFrames", () => {
  it("starts covering the card, centred on it, clipped to its crop", () => {
    const from = { left: 0, top: 0, width: 100, height: 100 };
    const to = { left: 300, top: 100, width: 400, height: 200 };
    const [start, end] = ghostFrames(from, to, uniformRadii(16), uniformRadii(0));
    // Even scale: max(100/400, 100/200) = 0.5, so the 2:1 photo is 200x100 and covers the square.
    expect(start.transform).toBe("translate(-450px, -150px) scale(0.5)");
    // Visible part in the ghost's own pixels: 200 wide of 400 → 100 each side; full height.
    expect(start.clipPath).toBe("inset(0px 100px 0px 100px round 32px 32px 32px 32px)");
    expect(end).toEqual({
      transform: "translate(0px, 0px) scale(1)",
      clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)",
    });
  });

  it("keeps per-corner radii", () => {
    const box = { left: 0, top: 0, width: 200, height: 100 };
    const [start] = ghostFrames(box, box, [16, 16, 0, 0], uniformRadii(0));
    expect(start.clipPath).toBe("inset(0px 0px 0px 0px round 16px 16px 0px 0px)");
  });
});

describe("isOnScreen", () => {
  const viewport = { width: 390, height: 844 };
  it("is true for a box partly in view", () => {
    expect(isOnScreen({ left: -50, top: 800, width: 100, height: 100 }, viewport)).toBe(true);
  });
  it("is false for a box above the screen or empty", () => {
    expect(isOnScreen({ left: 0, top: -200, width: 100, height: 100 }, viewport)).toBe(false);
    expect(isOnScreen({ left: 10, top: 10, width: 0, height: 0 }, viewport)).toBe(false);
  });
});

describe("originWithin", () => {
  it("is the card centre in the panel's pixels", () => {
    expect(
      originWithin({ left: 100, top: 50, width: 800, height: 600 }, { left: 200, top: 300, width: 100, height: 40 }),
    ).toBe("150px 270px");
  });
});
