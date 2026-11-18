import { beforeEach, describe, expect, it } from "vitest";
import {
  forgetPageSets,
  getPageSet,
  keptFullItem,
  rememberShownView,
  removeFromPageSets,
  replaceInPageSets,
  setPageSet,
  shownMediaView,
} from "@/app/admin/(protected)/media/lib/media-page-sets";
import { NO_FILTERS, type MediaListItem } from "@/app/admin/(protected)/media/lib/media-pages";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type Full = AdminSnapshot["media"]["full"][string];
const listItem = (id: string, title = id) => ({ id, title }) as MediaListItem;
const fullItem = (id: string, title = id) => ({ id, title }) as Full;

function put(key: string, ids: string[]) {
  setPageSet(key, () => ({
    items: ids.map((id) => listItem(id)),
    nextCursor: null,
    full: Object.fromEntries(ids.map((id) => [id, fullItem(id)])),
    generation: 1,
  }));
}

beforeEach(() => forgetPageSets());

describe("kept media list pages", () => {
  it("keeps only the newest six views", () => {
    for (let n = 1; n <= 7; n++) put(`view ${n}`, [String(n)]);
    expect(getPageSet("view 1")).toBeUndefined();
    expect(getPageSet("view 7")?.items).toHaveLength(1);
  });

  it("puts a saved item into every view that shows it, with its full data", () => {
    put("a", ["1", "2"]);
    put("b", ["2", "3"]);
    replaceInPageSets(listItem("2", "Renamed"), fullItem("2", "Renamed"));
    expect(getPageSet("a")?.items[1]?.title).toBe("Renamed");
    expect(getPageSet("b")?.items[0]?.title).toBe("Renamed");
    expect(keptFullItem("2")?.title).toBe("Renamed");
  });

  it("takes a deleted item out of every view", () => {
    put("a", ["1", "2"]);
    put("b", ["2"]);
    removeFromPageSets(["2"]);
    expect(getPageSet("a")?.items.map((i) => i.id)).toEqual(["1"]);
    expect(getPageSet("b")?.items).toEqual([]);
    expect(keptFullItem("2")).toBeNull();
  });

  it("remembers the view the list showed last", () => {
    expect(shownMediaView()).toEqual(NO_FILTERS);
    rememberShownView({ ...NO_FILTERS, query: "boat" });
    expect(shownMediaView().query).toBe("boat");
  });
});
