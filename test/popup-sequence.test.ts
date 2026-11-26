// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { arrowStep, recentSamples, releaseVelocity, swipeStep } from "@/lib/popup-sequence";
import { parseRadii } from "@/lib/client/expand-origin";
import { usePopupSequence, type MorePages } from "@/components/shared/popup-sequence/usePopupSequence";

const swipe = (dx: number, velocity = 0, ends = { canPrevious: true, canNext: true }) =>
  swipeStep({ dx, velocity, width: 400, ...ends });

describe("a released swipe", () => {
  test("moves on when it travels a quarter of the photo: left is next, right is previous", () => {
    expect(swipe(-100)).toBe(1);
    expect(swipe(100)).toBe(-1);
    expect(swipe(-99)).toBeNull();
  });

  test("moves on when it is flicked that way, but never under 24 px", () => {
    expect(swipe(-30, -0.5)).toBe(1);
    expect(swipe(30, 0.5)).toBe(-1);
    expect(swipe(-30, 0.5)).toBeNull();
    expect(swipe(-20, -2)).toBeNull();
  });

  test("goes back when there is no item that way", () => {
    expect(swipe(-200, -1, { canPrevious: true, canNext: false })).toBeNull();
    expect(swipe(200, 1, { canPrevious: false, canNext: true })).toBeNull();
  });

  test("reads its speed from the last 100 ms", () => {
    const samples = recentSamples(
      recentSamples([{ x: 0, t: 0 }], { x: 10, t: 150 }),
      { x: 60, t: 200 }
    );
    expect(samples).toEqual([
      { x: 10, t: 150 },
      { x: 60, t: 200 },
    ]);
    expect(releaseVelocity(samples)).toBe(1);
    expect(releaseVelocity([{ x: 5, t: 10 }])).toBe(0);
  });
});

describe("the arrow keys", () => {
  const key = (keyName: string, extra: Partial<KeyboardEvent> = {}) =>
    arrowStep({ key: keyName, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, target: document.body, ...extra });

  test("step forward and back", () => {
    expect(key("ArrowRight")).toBe(1);
    expect(key("ArrowLeft")).toBe(-1);
    expect(key("ArrowUp")).toBeNull();
  });

  test("leave the browser's own shortcuts alone (Cmd/Alt + ← is Back)", () => {
    expect(key("ArrowLeft", { metaKey: true })).toBeNull();
    expect(key("ArrowLeft", { altKey: true })).toBeNull();
    expect(key("ArrowRight", { ctrlKey: true })).toBeNull();
    expect(key("ArrowRight", { shiftKey: true })).toBeNull();
  });

  test("leave fields and videos to move their cursor or seek", () => {
    document.body.innerHTML = '<input id="field" /><video id="film"></video><button id="close"></button>';
    expect(key("ArrowRight", { target: document.getElementById("field") })).toBeNull();
    expect(key("ArrowRight", { target: document.getElementById("film") })).toBeNull();
    expect(key("ArrowRight", { target: document.getElementById("close") })).toBe(1);
  });
});

test("a card's corners are read from its data-expand-radii", () => {
  expect(parseRadii("16 16 0 0")).toEqual([16, 16, 0, 0]);
  expect(parseRadii("36")).toEqual([36, 36, 36, 36]);
  expect(parseRadii(null)).toEqual([0, 0, 0, 0]);
  expect(parseRadii("16 x")).toEqual([0, 0, 0, 0]);
});

const ITEMS = [{ id: "a" }, { id: "b" }, { id: "c" }];

function more(overrides: Partial<MorePages> = {}): MorePages {
  return { canLoadMore: false, isLoadingMore: false, failed: false, loadMore: vi.fn(), ...overrides };
}

describe("the popup's item", () => {
  test("moves through the list on screen and stops at its ends", () => {
    const { result } = renderHook(() => usePopupSequence(ITEMS));
    expect(result.current.nav).toBeNull();

    act(() => result.current.open(ITEMS[0]));
    expect(result.current.active?.id).toBe("a");
    expect(result.current.nav).toMatchObject({ hasPrevious: false, hasNext: true, nextLoaded: true, waiting: false });

    act(() => result.current.nav!.step(1));
    act(() => result.current.nav!.step(1));
    expect(result.current.active?.id).toBe("c");
    expect(result.current.nav).toMatchObject({ hasPrevious: true, hasNext: false });

    let moved = true;
    act(() => {
      moved = result.current.nav!.step(1);
    });
    expect(moved).toBe(false);
    expect(result.current.active?.id).toBe("c");
    act(() => {
      moved = result.current.nav!.step(-1);
    });
    expect(moved).toBe(true);
    expect(result.current.active?.id).toBe("b");

    act(() => result.current.close());
    expect(result.current.active).toBeNull();
  });

  test("near the end of what is loaded, fetches the next page before Next is pressed", () => {
    const loadMore = vi.fn();
    const long = Array.from({ length: 10 }, (_, n) => ({ id: `i${n}` }));
    const { result } = renderHook(() => usePopupSequence(long, { more: more({ canLoadMore: true, loadMore }) }));

    act(() => result.current.open(long[0]));
    expect(loadMore).not.toHaveBeenCalled();
    act(() => result.current.open(long[4]));
    expect(loadMore).not.toHaveBeenCalled();
    act(() => result.current.open(long[5]));
    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  test("Next on the last loaded item waits for the page, then moves on to it", () => {
    const loadMore = vi.fn();
    const { result, rerender } = renderHook(({ items, pages }) => usePopupSequence(items, { more: pages }), {
      initialProps: { items: ITEMS, pages: more({ canLoadMore: true, isLoadingMore: true, loadMore }) },
    });

    act(() => result.current.open(ITEMS[2]));
    expect(result.current.nav).toMatchObject({ hasNext: true, nextLoaded: false });
    act(() => result.current.nav!.step(1));
    expect(result.current.nav!.waiting).toBe(true);
    expect(result.current.active?.id).toBe("c");

    rerender({ items: [...ITEMS, { id: "d" }], pages: more({ canLoadMore: false, loadMore }) });
    expect(result.current.active?.id).toBe("d");
    expect(result.current.nav!.waiting).toBe(false);
    expect(loadMore).not.toHaveBeenCalled();
  });

  test("doesn't ask for a page already on its way", () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() =>
      usePopupSequence(ITEMS, { more: more({ canLoadMore: true, isLoadingMore: true, loadMore }) })
    );
    act(() => result.current.open(ITEMS[2]));
    act(() => result.current.nav!.step(1));
    expect(loadMore).not.toHaveBeenCalled();
    expect(result.current.nav!.waiting).toBe(true);
  });

  test("stops waiting when the page fails or no page is left", () => {
    const { result, rerender } = renderHook(({ pages }) => usePopupSequence(ITEMS, { more: pages }), {
      initialProps: { pages: more({ canLoadMore: true }) },
    });
    act(() => result.current.open(ITEMS[2]));
    act(() => result.current.nav!.step(1));
    rerender({ pages: more({ canLoadMore: true, failed: true }) });
    expect(result.current.nav!.waiting).toBe(false);
    expect(result.current.active?.id).toBe("c");

    act(() => result.current.nav!.step(1));
    rerender({ pages: more({ canLoadMore: false }) });
    expect(result.current.nav!.waiting).toBe(false);
  });

  test("starts the items either side downloading", () => {
    const preload = vi.fn();
    const { result } = renderHook(() => usePopupSequence(ITEMS, { preload }));
    act(() => result.current.open(ITEMS[1]));
    expect(preload.mock.calls.map(([item]) => item.id).sort()).toEqual(["a", "c"]);
  });

  test("keeps showing an item the list no longer holds, with nowhere to step", () => {
    const { result, rerender } = renderHook(({ items }) => usePopupSequence(items), { initialProps: { items: ITEMS } });
    act(() => result.current.open(ITEMS[1]));
    rerender({ items: [{ id: "x" }] });
    expect(result.current.active?.id).toBe("b");
    expect(result.current.nav).toMatchObject({ hasPrevious: false, hasNext: false });
  });
});
