import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { memoryDb, resetMemoryDb } from "@/test/support/memory-db";

vi.mock("@/lib/server/db", () => ({ getDb: async () => memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));

import { GET } from "@/app/api/media/admin-list/route";
import { matchingIdsUrl } from "@/app/admin/(protected)/media/lib/media-pages";

const media = (title: string, extra: Record<string, unknown> = {}) => ({
  _id: new ObjectId(),
  title,
  type: "image",
  categories: ["photography"],
  isPublic: true,
  createdAt: new Date(),
  ...extra,
});

const seeded = {
  fashionHidden: media("Fashion hidden", { isPublic: false, tags: ["fashion"] }),
  fashionPublic: media("Fashion public", { tags: ["fashion"] }),
  dance: media("Dance reel", { type: "video", categories: ["videography"] }),
};

async function ids(query: string) {
  const res = await GET(new Request(`https://hm.test/api/media/admin-list?${query}`));
  expect(res.status).toBe(200);
  return ((await res.json()) as { ids: string[] }).ids;
}

const idOf = (doc: { _id: ObjectId }) => String(doc._id);

beforeEach(() => resetMemoryDb({ media: Object.values(seeded) }));

describe("GET /api/media/admin-list?idsOnly=1 — Select all in the gallery picker", () => {
  test("returns every match of the search and filters, as ids only", async () => {
    expect(await ids("idsOnly=1&q=fashion")).toEqual([idOf(seeded.fashionHidden), idOf(seeded.fashionPublic)]);
    expect(await ids("idsOnly=1&q=fashion&visibility=private")).toEqual([idOf(seeded.fashionHidden)]);
    expect(await ids("idsOnly=1&type=video")).toEqual([idOf(seeded.dance)]);
    expect(await ids("idsOnly=1&category=videography")).toEqual([idOf(seeded.dance)]);
  });

  test("ignores a cursor and an id list, so it never answers a page or someone else's selection", async () => {
    const cursor = Buffer.from(JSON.stringify({ createdAt: new Date(0).toISOString(), id: idOf(seeded.dance) })).toString("base64url");
    expect(await ids(`idsOnly=1&q=fashion&cursor=${cursor}&ids=${idOf(seeded.dance)}`)).toHaveLength(2);
  });

  test("the picker asks for the same filters, without a page size", () => {
    const url = new URL(
      matchingIdsUrl({ query: " fashion ", category: "photography", type: "", visibility: "private" }),
      "https://hm.test"
    );
    expect(url.pathname).toBe("/api/media/admin-list");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "fashion",
      category: "photography",
      visibility: "private",
      idsOnly: "1",
    });
  });
});
