// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEARCH_DELAY_MS, useDebouncedSearch } from "@/hooks/useDebouncedSearch";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedSearch", () => {
  it("shows the words at once and searches 500 ms after the last keystroke", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setText("ind"));
    expect(result.current.text).toBe("ind");
    expect(result.current.query).toBe("");

    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS - 1));
    expect(result.current.query).toBe("");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.query).toBe("ind");
  });

  it("restarts the wait on every keystroke", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setText("i"));
    act(() => vi.advanceTimersByTime(400));
    act(() => result.current.setText("in"));
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.query).toBe("");
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.query).toBe("in");
  });

  it("clears at once", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setText("ind"));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    act(() => result.current.clear());
    expect(result.current.text).toBe("");
    expect(result.current.query).toBe("");
  });

  it("applies a starting value (a search brought back by Back) without waiting", () => {
    const { result } = renderHook(() => useDebouncedSearch("ind"));
    expect(result.current.text).toBe("ind");
    expect(result.current.query).toBe("ind");
  });
});
