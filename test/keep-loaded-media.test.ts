import { describe, expect, test } from "vitest";
import { keepLoadedMedia } from "@/lib/client/keep-loaded-media";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

function item(n: number) {
  return { id: `id${String(n).padStart(3, "0")}`, createdAt: `2026-09-${String(30 - Math.floor(n / 10)).padStart(2, "0")}T00:00:${String(59 - (n % 10)).padStart(2, "0")}.000Z` };
}

function snapshot(numbers: number[], nextCursor: string | null) {
  const items = numbers.map(item);
  return {
    media: {
      items,
      nextCursor,
      full: Object.fromEntries(items.map((entry) => [entry.id, { id: entry.id }])),
    },
  } as unknown as AdminSnapshot;
}

const range = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i);

describe("media pages loaded on the phone", () => {
  test("a fresh first page keeps the older pages already loaded below it", () => {
    const loaded = snapshot(range(0, 90), "after-89");
    const fresh = snapshot(range(0, 60), "after-59");
    const merged = keepLoadedMedia(fresh, loaded).media;
    expect(merged.items).toHaveLength(90);
    expect(merged.nextCursor).toBe("after-89");
    expect(merged.full[item(75).id]).toBeDefined();
  });

  test("an item that moved onto the first page is not listed twice", () => {
    const loaded = snapshot(range(0, 90), "after-89");
    const fresh = snapshot([...range(1, 60), 70], "after-70");
    const merged = keepLoadedMedia(fresh, loaded).media;
    expect(merged.items.filter((entry) => entry.id === item(70).id)).toHaveLength(1);
  });

  test("nothing is kept when the first page is the whole library", () => {
    const loaded = snapshot(range(0, 70), null);
    const fresh = snapshot(range(0, 50), null);
    expect(keepLoadedMedia(fresh, loaded)).toBe(fresh);
  });

  test("nothing is kept when no more than the first page was loaded", () => {
    const loaded = snapshot(range(0, 60), "after-59");
    const fresh = snapshot(range(0, 60), "after-59");
    expect(keepLoadedMedia(fresh, loaded)).toBe(fresh);
  });
});
