// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  persistScroll,
  resetScrollPositions,
  saveScroll,
  savedScroll,
} from "@/lib/client/scroll-positions";

beforeEach(() => {
  window.sessionStorage.clear();
  resetScrollPositions();
});

describe("scroll positions", () => {
  it("remembers each history entry's last position, rounded", () => {
    saveScroll("a", 8429.4);
    saveScroll("b", 120);
    saveScroll("a", 8430.6);
    expect(savedScroll("a")).toBe(8431);
    expect(savedScroll("b")).toBe(120);
    expect(savedScroll("c")).toBeUndefined();
  });

  it("survives a reload through sessionStorage once the page is left", () => {
    saveScroll("a", 640);
    persistScroll();
    resetScrollPositions();
    expect(savedScroll("a")).toBe(640);
  });

  it("keeps only the newest 50", () => {
    for (let i = 0; i < 51; i += 1) saveScroll(`entry-${i}`, i);
    expect(savedScroll("entry-0")).toBeUndefined();
    expect(savedScroll("entry-50")).toBe(50);
  });

  it("ignores a broken or tampered stored value", () => {
    window.sessionStorage.setItem("hm.scroll-positions", '[["a", "lots"], ["b", 12], "x"]');
    resetScrollPositions();
    expect(savedScroll("a")).toBeUndefined();
    expect(savedScroll("b")).toBe(12);

    window.sessionStorage.setItem("hm.scroll-positions", "{not json");
    resetScrollPositions();
    expect(savedScroll("b")).toBeUndefined();
  });
});
