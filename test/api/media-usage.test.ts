import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { deleteStoredMediaAsset, moveStoredMediaAssetToFolder, revalidateSitePages } = vi.hoisted(() => ({
  deleteStoredMediaAsset: vi.fn(),
  moveStoredMediaAssetToFolder: vi.fn(),
  revalidateSitePages: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces: vi.fn(), revalidateSitePages }));
vi.mock("@/lib/server/video-posters", () => ({
  storeVideoPoster: vi.fn(async () => null),
  deleteVideoPoster: vi.fn(),
  discardUnsavedPoster: vi.fn(),
}));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  getPrivateGalleryTitlesForMedia: async () => [],
  findPrivateGalleriesUsingMedia: async () => [],
  formatPrivateGalleryMediaDeleteBlocker: () => "",
}));
vi.mock("@/lib/server/media-asset-management", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/media-asset-management")>(
    "@/lib/server/media-asset-management"
  );
  return { ...actual, deleteStoredMediaAsset, moveStoredMediaAssetToFolder };
});

import { DELETE as remove, PATCH as patch } from "@/app/api/media/[id]/route";
import { POST as usages } from "@/app/api/media/usages/route";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1";
const OLD_ID = "hm_visuals/media/photography/old";
const OLD_URL = `${CLOUD}/${OLD_ID}.jpg`;
const NEW_ID = "hm_visuals/media/photography/new";
const NEW_URL = `${CLOUD}/${NEW_ID}.jpg`;
const MOVED_ID = "hm_visuals/media/art/old";
const MOVED_URL = `${CLOUD}/${MOVED_ID}.jpg`;
const YT = "Or18TXg2bnY";

const photo = { title: "Dune", categories: ["photography"], tags: [], peopleIds: [], appearances: [], type: "image" };
const withNewFile = { ...photo, secureUrl: NEW_URL, publicId: NEW_ID, resourceType: "image" };

let media: Record<string, unknown> & { _id: ObjectId };

function seed(heroUrl = OLD_URL) {
  media = {
    _id: new ObjectId(),
    type: "image",
    title: "Dune",
    categories: ["photography"],
    secureUrl: OLD_URL,
    publicId: OLD_ID,
    resourceType: "image",
  };
  resetMemoryDb({
    media: [media],
    page_sections: [{ slug: "home", data: { hero: { image: { url: heroUrl, publicId: "" } }, featuredCards: [] } }],
    page_settings: [{ slug: "nft", cardImage: { url: OLD_URL, publicId: "" } }],
    page_seo: [],
    blog_posts: [],
  });
}

const heroUrl = () => (memory.collections.page_sections![0]!.data as { hero: { image: { url: string } } }).hero.image.url;
const cardUrl = () => (memory.collections.page_settings![0]!.cardImage as { url: string }).url;
const ctx = () => ({ params: Promise.resolve({ id: String(media._id) }) });
const del = (query = "") => remove(new Request(`http://localhost/api/media/x${query}`, { method: "DELETE" }), ctx());
const edit = (body: Record<string, unknown>) =>
  patch(new Request("http://localhost/api/media/x", { method: "PATCH", body: JSON.stringify(body) }), ctx());

const IN_USE = { id: expect.any(String), title: "Dune", usedOn: ["Home — hero", "Work overlay — NFT"] };

beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  seed();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("DELETE /api/media/[id]", () => {
  test("is blocked while a page uses the file, naming every place, and touches nothing", async () => {
    const res = await del();

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ ok: false, code: "MEDIA_IN_USE", items: [IN_USE] });
    expect(memory.collections.media).toHaveLength(1);
    expect(deleteStoredMediaAsset).not.toHaveBeenCalled();
    expect(heroUrl()).toBe(OLD_URL);
  });

  test("with ?detach=1 empties those places, then deletes the item and its file", async () => {
    const res = await del("?detach=1");

    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(cardUrl()).toBe("");
    expect(memory.collections.media).toHaveLength(0);
    expect(deleteStoredMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ publicId: OLD_ID }));
    expect(revalidateSitePages).toHaveBeenCalled();
  });

  test("deletes straight away when nothing uses the file", async () => {
    seed(NEW_URL);
    memory.collections.page_settings = [];

    expect((await del()).status).toBe(200);
    expect(deleteStoredMediaAsset).toHaveBeenCalledTimes(1);
    expect(heroUrl()).toBe(NEW_URL);
  });

  test("keeps everything when a page could not be updated", async () => {
    memory.failWritesTo.add("page_settings");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await del("?detach=1");

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Could not update: Work overlay — NFT. Nothing was deleted.");
    expect(memory.collections.media).toHaveLength(1);
    expect(deleteStoredMediaAsset).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/media/[id] — replacing a file a page uses", () => {
  test("is blocked with the places and an offer to use the new photo; nothing is written", async () => {
    const res = await edit(withNewFile);

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "MEDIA_IN_USE", canReplace: true, items: [IN_USE] });
    expect(media.publicId).toBe(OLD_ID);
    expect(deleteStoredMediaAsset).not.toHaveBeenCalled();
  });

  test("usages=replace puts the new photo in those places and deletes the old file", async () => {
    const res = await edit({ ...withNewFile, usages: "replace" });

    expect(res.status).toBe(200);
    expect(media.publicId).toBe(NEW_ID);
    expect(heroUrl()).toBe(NEW_URL);
    expect(cardUrl()).toBe(NEW_URL);
    expect(deleteStoredMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ publicId: OLD_ID }));
  });

  test("usages=remove empties those places and deletes the old file", async () => {
    const res = await edit({ ...withNewFile, usages: "remove" });

    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(cardUrl()).toBe("");
    expect(deleteStoredMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ publicId: OLD_ID }));
  });

  test("switching to a video link cannot put the video in an image slot", async () => {
    const body = { ...photo, categories: ["videography"], type: "embed", embedUrl: `https://youtu.be/${YT}` };

    const blocked = await edit(body);
    expect(await blocked.json()).toMatchObject({ code: "MEDIA_IN_USE", canReplace: false });
    expect((await edit({ ...body, usages: "replace" })).status).toBe(400);

    const res = await edit({ ...body, usages: "remove" });
    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(deleteStoredMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ publicId: OLD_ID }));
  });

  test("the old file survives when a place could not be updated, and the response names it", async () => {
    memory.failWritesTo.add("page_settings");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await edit({ ...withNewFile, usages: "replace" });

    expect(await res.json()).toEqual({ ok: true, pagesNotUpdated: ["Work overlay — NFT"] });
    expect(heroUrl()).toBe(NEW_URL);
    expect(deleteStoredMediaAsset).not.toHaveBeenCalled();
  });

  test("an unused file is replaced with no question", async () => {
    seed(NEW_URL);
    memory.collections.page_settings = [];

    expect((await edit(withNewFile)).status).toBe(200);
    expect(deleteStoredMediaAsset).toHaveBeenCalledTimes(1);
  });
});

describe("PATCH /api/media/[id] — changing category", () => {
  test("moves the file and points every place at its new link, with no question", async () => {
    moveStoredMediaAssetToFolder.mockResolvedValue({ secureUrl: MOVED_URL, publicId: MOVED_ID, resourceType: "image" });

    const res = await edit({ ...photo, categories: ["art"] });

    expect(res.status).toBe(200);
    expect(media.publicId).toBe(MOVED_ID);
    expect(heroUrl()).toBe(MOVED_URL);
    expect(cardUrl()).toBe(MOVED_URL);
    expect(revalidateSitePages).toHaveBeenCalled();
  });
});

describe("POST /api/media/usages", () => {
  test("lists only the items a page uses", async () => {
    const unused = { _id: new ObjectId(), title: "Spare", publicId: "hm_visuals/media/photography/spare" };
    memory.collections.media!.push(unused);

    const res = await usages(
      new Request("http://localhost/api/media/usages", {
        method: "POST",
        body: JSON.stringify({ ids: [String(media._id), String(unused._id)] }),
      })
    );

    expect(await res.json()).toEqual({ ok: true, items: [{ ...IN_USE, id: String(media._id) }] });
  });
});
