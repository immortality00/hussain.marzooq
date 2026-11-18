// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The address as Next.js reports it: a test sets it, as a link to the same screen would.
const address = vi.hoisted(() => ({ search: "", pathname: "/admin/testimonials" }));

vi.mock("next/navigation", () => ({
  usePathname: () => address.pathname,
  useSearchParams: () => new URLSearchParams(address.search),
}));

import { useAddressValues } from "@/hooks/useAddressValues";
import { useDebouncedText, SEARCH_DELAY_MS } from "@/hooks/useDebouncedSearch";
import { resetAddressWriter } from "@/lib/client/address-writer";

const KEYS = ["status", "q"] as const;

beforeEach(() => {
  vi.useFakeTimers();
  resetAddressWriter();
  address.search = "?status=pending";
  window.history.replaceState(null, "", `${address.pathname}${address.search}`);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAddressValues", () => {
  it("starts from the address, so a link can open a filtered view", () => {
    const { result } = renderHook(() => useAddressValues(KEYS));
    expect(result.current[0]).toEqual({ status: "pending", q: "" });
  });

  it("shows a change at once and puts it in the address", () => {
    const { result } = renderHook(() => useAddressValues(KEYS));
    act(() => result.current[1]({ status: "approved" }));
    expect(result.current[0].status).toBe("approved");
    act(() => vi.advanceTimersByTime(0));
    expect(window.location.search).toBe("?status=approved");
  });

  it("follows the address when it changes from outside", () => {
    const { result, rerender } = renderHook(() => useAddressValues(KEYS));
    address.search = "";
    rerender();
    expect(result.current[0]).toEqual({ status: "", q: "" });
  });

  it("keeps its own change while the address catches up", () => {
    const { result, rerender } = renderHook(() => useAddressValues(KEYS));
    act(() => result.current[1]({ q: "lina" }));
    rerender();
    expect(result.current[0].q).toBe("lina");
    address.search = "?status=pending&q=lina";
    rerender();
    expect(result.current[0]).toEqual({ status: "pending", q: "lina" });
  });
});

describe("useDebouncedText", () => {
  it("hands the words over 500 ms after the last keystroke", () => {
    const onQuery = vi.fn();
    const { result } = renderHook(() => useDebouncedText("", onQuery));
    act(() => result.current.setText("lin"));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS - 1));
    expect(onQuery).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onQuery).toHaveBeenCalledWith("lin");
  });

  it("shows a query that changed from outside (a link, Back)", () => {
    const { result, rerender } = renderHook(({ query }) => useDebouncedText(query, vi.fn()), {
      initialProps: { query: "" },
    });
    rerender({ query: "seed photo" });
    expect(result.current.text).toBe("seed photo");
  });

  it("clears the box and the query at once", () => {
    const onQuery = vi.fn();
    const { result } = renderHook(() => useDebouncedText("seed", onQuery));
    act(() => result.current.clear());
    expect(result.current.text).toBe("");
    expect(onQuery).toHaveBeenCalledWith("");
  });
});
