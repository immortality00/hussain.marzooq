import { describe, expect, it } from "vitest";
import { itemNeighbours, keptKeyOf, rowsOfView } from "@/app/admin/(protected)/media/lib/media-list-rows";
import { NO_FILTERS, TAIL_KEY, filtersKey, type MediaListItem } from "@/app/admin/(protected)/media/lib/media-pages";
import type { PageSet } from "@/app/admin/(protected)/media/lib/media-page-sets";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

const item = (id: string) => ({ id }) as MediaListItem;
const items = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => item(String(from + i)));
const media = (list: MediaListItem[], nextCursor: string | null) =>
  ({ items: list, nextCursor, full: {} }) as AdminSnapshot["media"];
const kept = (list: MediaListItem[], nextCursor: string | null): PageSet => ({
  items: list,
  nextCursor,
  full: {},
  generation: 0,
});

describe("itemNeighbours", () => {
  const ids = ["40", "41", "42"];

  it("gives the rows before and after", () => {
    expect(itemNeighbours(ids, "41", false)).toEqual({ found: true, previous: "40", next: "42", loadsMore: false });
  });

  it("has no previous at the first row, and loads more past the last one when there is more", () => {
    expect(itemNeighbours(ids, "40", false).previous).toBeNull();
    expect(itemNeighbours(ids, "42", true)).toEqual({ found: true, previous: "41", next: null, loadsMore: true });
    expect(itemNeighbours(ids, "42", false).loadsMore).toBe(false);
  });

  it("knows when the item is not in the rows", () => {
    expect(itemNeighbours(ids, "99", true)).toEqual({ found: false, previous: null, next: null, loadsMore: false });
  });
});

describe("rowsOfView", () => {
  it("is the shared admin data while it holds fewer than 300 items", () => {
    const rows = rowsOfView(NO_FILTERS, media(items(1, 60), "c60"), undefined);
    expect(rows.items).toHaveLength(60);
    expect(rows.nextCursor).toBe("c60");
  });

  it("goes on with the kept tail once the shared data is full", () => {
    const rows = rowsOfView(NO_FILTERS, media(items(1, 300), "c300"), kept(items(301, 360), "c360"));
    expect(rows.items).toHaveLength(360);
    expect(rows.nextCursor).toBe("c360");
    expect(rowsOfView(NO_FILTERS, media(items(1, 300), "c300"), undefined).nextCursor).toBe("c300");
  });

  it("is a search's own kept pages", () => {
    const search = { ...NO_FILTERS, query: "seed photo 3" };
    expect(rowsOfView(search, media(items(1, 60), "c60"), kept(items(3, 4), null)).items.map((i) => i.id)).toEqual([
      "3",
      "4",
    ]);
    expect(rowsOfView(search, media(items(1, 60), "c60"), undefined)).toEqual({ items: [], nextCursor: null });
  });

  it("keeps the default view's later pages under the tail, a search's under its filters", () => {
    expect(keptKeyOf(NO_FILTERS)).toBe(TAIL_KEY);
    const search = { ...NO_FILTERS, category: "videography" };
    expect(keptKeyOf(search)).toBe(filtersKey(search));
  });
});
