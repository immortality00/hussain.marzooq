// @vitest-environment jsdom
import { createElement, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExpandingSearch } from "@/components/search/ExpandingSearch";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// The search at the end of a person page's chip row, with a chip beside it.
function Row({ collapsible = true }: { collapsible?: boolean }) {
  const [value, setValue] = useState("");
  return createElement(
    "div",
    null,
    createElement("button", { type: "button" }, "fashion"),
    createElement(ExpandingSearch, {
      value,
      onValueChange: setValue,
      onClear: () => setValue(""),
      placeholder: "Search…",
      collapsible,
    }),
  );
}

const box = () => document.querySelector(".hm-expanding-search") as HTMLElement;
const input = () => screen.getByRole("textbox", { name: "Search…", hidden: true });
const chip = () => screen.getByRole("button", { name: "fashion" });

function openBox() {
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

describe("ExpandingSearch", () => {
  it("is an icon below 768px until tapped, then a box with the cursor in it", () => {
    render(createElement(Row));
    expect(box().hasAttribute("data-open")).toBe(false);
    expect(input().parentElement?.parentElement?.className).toContain("hidden");

    openBox();

    expect(box().hasAttribute("data-open")).toBe(true);
    expect(screen.queryByRole("button", { name: "Search" })).toBeNull();
    expect(document.activeElement).toBe(input());
  });

  it("folds again when left empty, once the press that took the focus has clicked", () => {
    render(createElement(Row));
    openBox();

    act(() => chip().focus());
    expect(box().hasAttribute("data-open")).toBe(true);

    fireEvent.click(chip());
    expect(box().hasAttribute("data-open")).toBe(false);
    expect(screen.getByRole("button", { name: "Search" })).toBeTruthy();
  });

  it("folds after a moment when the focus leaves by keyboard", () => {
    vi.useFakeTimers();
    render(createElement(Row));
    openBox();

    act(() => chip().focus());
    act(() => vi.advanceTimersByTime(399));
    expect(box().hasAttribute("data-open")).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(box().hasAttribute("data-open")).toBe(false);
  });

  it("stays open while it holds a search", () => {
    vi.useFakeTimers();
    render(createElement(Row));
    openBox();
    fireEvent.change(input(), { target: { value: "gown" } });

    act(() => chip().focus());
    fireEvent.click(chip());
    act(() => vi.advanceTimersByTime(1000));

    expect(box().hasAttribute("data-open")).toBe(true);
    expect(input()).toHaveProperty("value", "gown");
  });

  it("folds on Escape when empty and puts the focus back on the icon", () => {
    render(createElement(Row));
    openBox();
    fireEvent.keyDown(input(), { key: "Escape" });

    expect(box().hasAttribute("data-open")).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Search" }));
  });

  it("fills the row with nothing beside it", () => {
    render(createElement(Row, { collapsible: false }));
    expect(box().hasAttribute("data-fill")).toBe(true);
    expect(box().hasAttribute("data-open")).toBe(true);
    expect(screen.queryByRole("button", { name: "Search" })).toBeNull();
  });
});
