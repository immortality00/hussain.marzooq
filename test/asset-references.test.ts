import { describe, expect, test } from "vitest";
import type { Db } from "mongodb";
import {
  findAssetUsages,
  findAssetUsagesByPublicId,
  isCloudinaryAssetReferenced,
} from "@/lib/server/asset-references";

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

  test("true when a media doc carries it as its video thumbnail", async () => {
    const db = {
      collection(name: string) {
        return {
          findOne: async (query: Record<string, unknown>) =>
            name === "media" && JSON.stringify(query).includes(`"posterPublicId":"${ID}"`) ? { _id: 1 } : null,
          find: () => ({ toArray: async () => [] }),
        };
      },
    } as unknown as Db;

    expect(await isCloudinaryAssetReferenced(db, ID)).toBe(true);
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

describe("findAssetUsages", () => {
  const url = (id: string) => `https://res.cloudinary.com/demo/image/upload/v1/${id}.jpg`;
  const pages = {
    page_sections: [{ slug: "home", data: { hero: { image: { url: url(ID), publicId: "" } } } }],
    page_seo: [{ slug: "about", ogImageUrl: url("hm_visuals/sections/other") }],
  };

  test("returns labelled places for one file", async () => {
    const found = await findAssetUsages(fakeDb(pages), ID);
    expect(found.map((usage) => usage.label)).toEqual(["Home — hero"]);
  });

  test("answers for many files from one set of reads", async () => {
    const found = await findAssetUsagesByPublicId(fakeDb(pages), [ID, "hm_visuals/sections/other", "unused"]);
    expect([...found.keys()]).toEqual([ID, "hm_visuals/sections/other"]);
    expect(found.get("hm_visuals/sections/other")!.map((usage) => usage.label)).toEqual(["About — share image"]);
  });

  test("a database error is thrown, never read as 'unused' — that would let a used file be deleted", async () => {
    await expect(findAssetUsages(fakeDb({}, { throws: true }), ID)).rejects.toThrow("db down");
  });
});
