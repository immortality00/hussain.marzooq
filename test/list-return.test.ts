// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  forgetListReturns,
  leaveList,
  returnToRow,
  revealRow,
  rowElement,
  showListReturn,
  takeListReturn,
} from "@/lib/client/list-return";

function row(id: string, top: number) {
  const element = document.createElement("div");
  element.setAttribute("data-list-row", id);
  element.getBoundingClientRect = () => ({ top, bottom: top + 100 }) as DOMRect;
  element.scrollIntoView = vi.fn();
  document.body.append(element);
  return element;
}

beforeEach(() => {
  vi.useFakeTimers();
  forgetListReturns();
  document.body.innerHTML = "";
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("list return", () => {
  it("records the opened row, its height on screen and the scroll", () => {
    const opened = row("41", 220);
    leaveList("media", "default", "41", opened);
    expect(takeListReturn("media", "default")).toEqual({ view: "default", rowId: "41", top: 220, scrollY: 0 });
  });

  it("is taken once, and only by the same view", () => {
    leaveList("media", "search", "41", row("41", 220));
    expect(takeListReturn("media", "other search")).toBeNull();
    expect(takeListReturn("media", "search")).toBeNull();
  });

  it("moves to the item the editor ended on, keeping the height", () => {
    leaveList("media", "default", "41", row("41", 220));
    returnToRow("media", "43");
    expect(takeListReturn("media", "default")).toMatchObject({ rowId: "43", top: 220 });
  });

  it("shows a new item where the list puts it", () => {
    leaveList("people", "", null, null);
    returnToRow("people", "new", { newRow: true });
    expect(takeListReturn("people", "")).toMatchObject({ rowId: "new", top: null });
  });

  it("finds the row a press came from", () => {
    const element = row("7", 0);
    const button = document.createElement("button");
    element.append(button);
    expect(rowElement(button)).toBe(element);
    expect(rowElement(null)).toBeNull();
  });

  it("puts the row back at its height and marks it for a moment", () => {
    const target = row("43", 900);
    showListReturn({ view: "default", rowId: "43", top: 220, scrollY: 0 });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 900 - 220);
    expect(target.classList.contains("hm-row-returned")).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(target.classList.contains("hm-row-returned")).toBe(false);
  });

  it("goes back to the scroll it was left at when the row is gone (deleted)", () => {
    showListReturn({ view: "default", rowId: "gone", top: 220, scrollY: 1234 });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 1234);
  });

  it("brings an alert's item into view and marks it, once its row is there", () => {
    expect(revealRow("9")).toBe(false);
    const target = row("9", 400);
    expect(revealRow("9")).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    expect(target.classList.contains("hm-row-returned")).toBe(true);
  });
});
