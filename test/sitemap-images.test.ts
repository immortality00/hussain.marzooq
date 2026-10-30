import { describe, expect, test, vi } from "vitest";

const find = vi.fn();
vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(async () => ({ collection: () => ({ find }) })),
}));

import { getPhotographySitemapPhotos } from "@/lib/server/sitemap-photos";
import { strictAllowList } from "@/lib/cloudinary-delivery";
import {
  MAX_SITEMAP_IMAGES,
  SITEMAP_IMAGE_WIDTH,
  sitemapImages,
  sitemapImageUrl,
} from "@/lib/sitemap-images";

const original = (id: string) => `https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/${id}.jpg`;

describe("sitemapImageUrl", () => {
  test("lists a photo at an allowed width, never the original", () => {
    const url = sitemapImageUrl(original("a"));
    const transform = url?.split("/upload/")[1]?.split("/")[0];
    expect(transform).toMatch(new RegExp(`^w_${SITEMAP_IMAGE_WIDTH},`));
    expect(strictAllowList()).toContain(transform);
  });

  test("drops anything that is not a public Cloudinary file", () => {
    expect(sitemapImageUrl("https://example.com/upload/a.jpg")).toBeNull();
    expect(sitemapImageUrl("https://res.cloudinary.com/demo/image/authenticated/v1/a.jpg")).toBeNull();
    expect(sitemapImageUrl("/api/media/asset/abc")).toBeNull();
    expect(sitemapImageUrl("http://res.cloudinary.com/demo/image/upload/v1/a.jpg")).toBeNull();
    expect(sitemapImageUrl("not a url")).toBeNull();
  });

  test("drops an address XML would read as markup", () => {
    expect(sitemapImageUrl(original("a&b"))).toBeNull();
    expect(sitemapImageUrl(original("a'b"))).toBeNull();
  });
});

describe("sitemapImages", () => {
  const photos = [
    { url: original("a"), tags: ["fashion"] },
    { url: original("b"), tags: ["portraits", "fashion"] },
    { url: original("a"), tags: ["fashion"] },
    { url: "https://example.com/c.jpg", tags: ["fashion"] },
  ];

  test("lists every photo once, in the given order", () => {
    expect(sitemapImages(photos)).toEqual([
      sitemapImageUrl(original("a")),
      sitemapImageUrl(original("b")),
    ]);
  });

  test("a tag page lists only its own photos", () => {
    expect(sitemapImages(photos, "portraits")).toEqual([sitemapImageUrl(original("b"))]);
    expect(sitemapImages(photos, "exhibitions")).toEqual([]);
  });

  test("stops at Google's limit per page", () => {
    const many = Array.from({ length: MAX_SITEMAP_IMAGES + 5 }, (_, i) => ({
      url: original(`p${i}`),
      tags: [],
    }));
    expect(sitemapImages(many)).toHaveLength(MAX_SITEMAP_IMAGES);
  });
});

describe("getPhotographySitemapPhotos", () => {
  test("reads public photography photos, newest first, with their tags", async () => {
    const sort = vi.fn(() => ({
      toArray: async () => [
        { _id: "1", secureUrl: original("a"), tags: ["fashion"] },
        { _id: "2", asset: { secureUrl: original("b") } },
        { _id: "3" },
      ],
    }));
    find.mockReturnValueOnce({ sort });

    await expect(getPhotographySitemapPhotos()).resolves.toEqual([
      { url: original("a"), tags: ["fashion"] },
      { url: original("b"), tags: [] },
    ]);
    const [query] = find.mock.calls[0];
    expect(JSON.stringify(query)).toContain('"categories":"photography"');
    expect(JSON.stringify(query)).toContain('"type":"image"');
    expect(sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
  });

  test("a failed read throws outside the build, so the last good sitemap is kept", async () => {
    find.mockImplementationOnce(() => {
      throw new Error("server selection timed out");
    });
    await expect(getPhotographySitemapPhotos()).rejects.toThrow("server selection timed out");
  });
});
