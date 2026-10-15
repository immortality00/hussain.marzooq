import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { moveStoredMediaAssetToFolder, storeVideoPoster, discardUnsavedPoster } = vi.hoisted(() => ({
  moveStoredMediaAssetToFolder: vi.fn(),
  storeVideoPoster: vi.fn(),
  discardUnsavedPoster: vi.fn(),
}));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces: vi.fn(), revalidateSitePages: vi.fn() }));
vi.mock("@/lib/server/video-posters", () => ({ storeVideoPoster, discardUnsavedPoster, deleteVideoPoster: vi.fn() }));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  getPrivateGalleryTitlesForMedia: async () => [],
  getPrivateGalleryTitlesByMedia: async () => new Map(),
  findPrivateGalleriesUsingMedia: async () => [],
  formatPrivateGalleryMediaDeleteBlocker: () => "",
}));
vi.mock("@/lib/server/media-asset-management", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/media-asset-management")>(
    "@/lib/server/media-asset-management"
  );
  return { ...actual, deleteStoredMediaAsset: vi.fn(), moveStoredMediaAssetToFolder };
});

import { PATCH as patch } from "@/app/api/media/[id]/route";
import { parseMediaPatch } from "@/app/api/media/[id]/_lib/parse-media-patch";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1";
const OLD_ID = "hm_visuals/media/photography/old";
const MOVED_ID = "hm_visuals/media/art/old";
const photo = { title: "Dune", categories: ["photography"], tags: [], peopleIds: [], appearances: [], type: "image" };

let media: Record<string, unknown> & { _id: ObjectId };

const edit = (body: unknown) =>
  patch(
    new Request("http://localhost/api/media/x", { method: "PATCH", body: JSON.stringify(body) }),
    { params: Promise.resolve({ id: String(media._id) }) }
  );

const errorOf = (body: unknown) => {
  const parsed = parseMediaPatch(body);
  return parsed.ok ? null : parsed.response.json().then((json: { error: string }) => json.error);
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo");
  moveStoredMediaAssetToFolder.mockReset();
  storeVideoPoster.mockReset();
  discardUnsavedPoster.mockReset();
  media = {
    _id: new ObjectId(),
    type: "image",
    title: "Dune",
    categories: ["photography"],
    secureUrl: `${CLOUD}/${OLD_ID}.jpg`,
    publicId: OLD_ID,
    resourceType: "image",
  };
  resetMemoryDb({ media: [media], page_sections: [], page_settings: [], page_seo: [], blog_posts: [] });
});

describe("parseMediaPatch", () => {
  test.each([
    ["a body that is not an object", "nope", "Invalid body"],
    ["a missing title", { ...photo, title: "  " }, "Title required"],
    ["no category", { ...photo, categories: [] }, "Choose at least one category."],
    [
      "a video link on a photo",
      { ...photo, type: "embed", embedUrl: "https://youtu.be/Or18TXg2bnY" },
      "Embed links are allowed only for videography or showreel.",
    ],
    [
      "a video link on an NFT",
      { ...photo, categories: ["videography", "nft"], type: "embed", embedUrl: "https://youtu.be/Or18TXg2bnY" },
      "Embed links are allowed only for videography or showreel.",
    ],
    [
      "a link that is not YouTube or Vimeo",
      { ...photo, categories: ["videography"], type: "embed", embedUrl: "https://example.com/v" },
      "Use a valid YouTube or Vimeo video URL.",
    ],
    ["invalid NFT details", { ...photo, categories: ["nft"], nft: { currency: "" } }, "Choose a valid NFT currency."],
  ])("refuses %s", async (_name, body, error) => {
    expect(await errorOf(body)).toBe(error);
  });

  test("treats a private-gallery proxy path as no new file", () => {
    const parsed = parseMediaPatch({ ...photo, secureUrl: "/api/media/asset/abc", publicId: "x", resourceType: "image" });
    expect(parsed.ok && parsed.input.incomingAsset).toBeNull();
  });
});

describe("PATCH /api/media/[id] file checks", () => {
  test("refuses to make an existing photo a showreel", async () => {
    const res = await edit({ ...photo, categories: ["showreel"] });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Showreel uploads must be video files.");
  });

  test("refuses an upload outside the category's folder", async () => {
    const otherId = "hm_visuals/media/videography/new";
    const res = await edit({ ...photo, secureUrl: `${CLOUD}/${otherId}.jpg`, publicId: otherId, resourceType: "image" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Uploaded media URL is outside the selected media category folder.");
    expect(memory.collections.media![0]!.publicId).toBe(OLD_ID);
  });
});

describe("PATCH /api/media/[id] when the save fails", () => {
  test("moves a re-categorised file back to its old folder", async () => {
    const moved = { secureUrl: `${CLOUD}/${MOVED_ID}.jpg`, publicId: MOVED_ID, resourceType: "image" };
    moveStoredMediaAssetToFolder.mockResolvedValueOnce(moved).mockResolvedValueOnce(null);
    memory.failWritesTo.add("media");

    await expect(edit({ ...photo, categories: ["art"] })).rejects.toThrow("media write failed");
    expect(moveStoredMediaAssetToFolder).toHaveBeenCalledTimes(2);
    expect(moveStoredMediaAssetToFolder.mock.calls[1]).toEqual([
      expect.objectContaining({ publicId: MOVED_ID }),
      "hm_visuals/media/photography",
    ]);
  });

  test("discards the thumbnail it just stored", async () => {
    media.categories = ["videography"];
    storeVideoPoster.mockResolvedValue({ url: `${CLOUD}/poster.jpg`, publicId: "hm_visuals/media/posters/p1" });
    memory.failWritesTo.add("media");

    const body = { ...photo, categories: ["videography"], type: "embed", embedUrl: "https://youtu.be/Or18TXg2bnY" };
    await expect(edit(body)).rejects.toThrow("media write failed");
    expect(discardUnsavedPoster).toHaveBeenCalledWith(expect.anything(), "hm_visuals/media/posters/p1");
  });
});
