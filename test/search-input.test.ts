// @vitest-environment jsdom
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { SearchInput } from "@/components/search/SearchInput";

afterEach(() => cleanup());

describe("SearchInput", () => {
  it("has a clear button inside the box once there is text", () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    const view = render(
      createElement(SearchInput, { value: "", onValueChange, onClear, placeholder: "Search people..." })
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    view.rerender(
      createElement(SearchInput, { value: "ind", onValueChange, onClear, placeholder: "Search people..." })
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search people..." }));
  });

  it("keeps the admin boxes' own Clear button beside the field", () => {
    const onValueChange = vi.fn();
    render(
      createElement(SearchInput, {
        value: "summer",
        onValueChange,
        placeholder: "Search galleries...",
        inputClassName: "admin-input",
        clearButtonClassName: "admin-button",
      })
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    const clear = screen.getByRole("button", { name: "Clear" });
    expect(clear.className).toBe("admin-button");
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("can hide the clear button (the NFT search closes and clears from its own button)", () => {
    render(
      createElement(SearchInput, { value: "muse", placeholder: "Search title or tags...", showClear: false })
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});
