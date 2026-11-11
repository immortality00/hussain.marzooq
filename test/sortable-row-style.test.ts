import { describe, expect, it } from "vitest";
import { SORTABLE_SETTLE_KEYFRAMES, SORTABLE_SETTLE_TIMING, sortableRowStyle } from "@/lib/sortable-row-style";

const rest = { transform: undefined, transition: undefined, isDragging: false, reduceMotion: false };

describe("sortableRowStyle", () => {
  it("lifts the dragged row to 105% with a slight tilt, above its neighbours", () => {
    const style = sortableRowStyle({ ...rest, transform: "translate3d(0px, 40px, 0)", isDragging: true });
    expect(style.scale).toBe(1.05);
    expect(style.rotate).toBe("0.8deg");
    expect(style.zIndex).toBe(1);
    expect(style.backgroundColor).toBe("var(--card)");
    expect(style.transform).toBe("translate3d(0px, 40px, 0)");
    expect(style.opacity).toBeUndefined();
  });

  it("never transitions the dragged row's transform, so it stays under the pointer", () => {
    const style = sortableRowStyle({ ...rest, isDragging: true });
    expect(style.transition).toBe(
      "scale 200ms cubic-bezier(0.23, 1, 0.32, 1), rotate 200ms cubic-bezier(0.23, 1, 0.32, 1)"
    );
  });

  it("at rest leaves only dnd-kit's own slide on the row", () => {
    const slide = "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)";
    const style = sortableRowStyle({ ...rest, transform: "translate3d(0px, -64px, 0)", transition: slide });
    expect(style.transition).toBe(slide);
    expect(style.scale).toBeUndefined();
    expect(style.rotate).toBeUndefined();
    expect(style.zIndex).toBeUndefined();
    expect(style.backgroundColor).toBeUndefined();
  });

  it("settles from the lift back to rest in 300ms on a curve that dips once, staying on top", () => {
    expect(SORTABLE_SETTLE_KEYFRAMES).toEqual([
      { scale: 1.05, rotate: "0.8deg", zIndex: 1 },
      { scale: 1, rotate: "0deg", zIndex: 1 },
    ]);
    expect(SORTABLE_SETTLE_TIMING).toEqual({ duration: 300, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
  });

  it("names every transitioned property — never `all`", () => {
    expect(sortableRowStyle({ ...rest, isDragging: true }).transition).not.toMatch(/\ball\b/);
  });

  it("reduced motion: no lift, no tilt, no settle — the row only stays on top while dragged", () => {
    const dragged = sortableRowStyle({ ...rest, isDragging: true, reduceMotion: true });
    expect(dragged.scale).toBeUndefined();
    expect(dragged.rotate).toBeUndefined();
    expect(dragged.transition).toBeUndefined();
    expect(dragged.zIndex).toBe(1);
    expect(sortableRowStyle({ ...rest, reduceMotion: true }).transition).toBeUndefined();
  });
});
