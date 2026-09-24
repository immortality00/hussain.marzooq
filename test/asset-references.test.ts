import { describe, expect, test } from "vitest";
import type { Db } from "mongodb";
import { isCloudinaryAssetReferenced } from "@/lib/server/asset-references";

type Docs = Record<string, Record<string, unknown>[]>;

function fakeDb(docs: Docs, opts: { throws?: boolean } = {}): Db {
  return {
    collection(name: string) {
      if (opts.throws) throw new Error("db down");
      const list = docs[name] ?? [];
      return {
        findOne: async (query: Record<string, unknown>) => {
          const text = JSON.stringify(query);
          const needle = /"(?:publicId|coverImagePublicId)":"([^"]+)"/.exec(text)?.[1];
          return list.find((d) => JSON.stringify(d).includes(needle ?? "\u0000")) ?? null;
        },
        find: () => ({ toArray: async () => list }),
      };
    },
  } as unknown as Db;
}

const ID = "hm_visuals/sections/abc123";

describe("isCloudinaryAssetReferenced", () => {
  test("false when no document mentions the asset", async () => {
    expect(await isCloudinaryAssetReferenced(fakeDb({}), ID)).toBe(false);
  });

  test("true when a media doc carries the publicId", async () => {
    expect(await isCloudinaryAssetReferenced(fakeDb({ media: [{ publicId: ID }] }), ID)).toBe(true);
  });

  test("true when a nested page_sections image carries it", async () => {
    const db = fakeDb({ page_sections: [{ slug: "home", hero: { image: { url: `https://x/${ID}.jpg`, publicId: ID } } }] });
    expect(await isCloudinaryAssetReferenced(db, ID)).toBe(true);
  });

  test("true when page_settings card image carries it", async () => {
    const db = fakeDb({ page_settings: [{ slug: "photography", cardImage: { publicId: ID } }] });
    expect(await isCloudinaryAssetReferenced(db, ID)).toBe(true);
  });

  test("an unrelated asset stays unreferenced", async () => {
    const db = fakeDb({ page_sections: [{ hero: { image: { publicId: "hm_visuals/sections/other" } } }] });
    expect(await isCloudinaryAssetReferenced(db, ID)).toBe(false);
  });

  test("a database error is thrown, never guessed — the caller must retry instead of losing track", async () => {
    await expect(isCloudinaryAssetReferenced(fakeDb({}, { throws: true }), ID)).rejects.toThrow("db down");
  });

  test("true when a blog post's markdown body embeds the asset", async () => {
    const db = fakeDb({ blog_posts: [{ content: `![x](https://res.cloudinary.com/demo/image/upload/v1/${ID}.jpg)` }] });
    expect(await isCloudinaryAssetReferenced(db, ID)).toBe(true);
  });

  test("an empty id is treated as referenced", async () => {
    expect(await isCloudinaryAssetReferenced(fakeDb({}), "  ")).toBe(true);
  });
});
