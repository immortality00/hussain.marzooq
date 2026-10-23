import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { deleteStoredMediaAsset, convertAssetDeliveryType } = vi.hoisted(() => ({
  deleteStoredMediaAsset: vi.fn(),
  convertAssetDeliveryType: vi.fn(async (params: { publicId: string; to: string }) => ({
    ok: true as const,
    secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/${params.publicId}.jpg`,
  })),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces: vi.fn(), revalidateSitePages: vi.fn() }));
vi.mock("@/lib/server/video-posters", () => ({
  storeVideoPoster: vi.fn(async () => null),
  deleteVideoPoster: vi.fn(),
  discardUnsavedPoster: vi.fn(),
}));
vi.mock("@/lib/server/media-asset-management", async () => ({
  ...(await vi.importActual<object>("@/lib/server/media-asset-management")),
  deleteStoredMediaAsset,
}));
vi.mock("@/lib/server/cloudinary-private", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-private")),
  convertAssetDeliveryType,
}));

import { PATCH as patch } from "@/app/api/media/[id]/route";
import { POST as create } from "@/app/api/media/create/route";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1";
const OLD_ID = "hm_visuals/media/photography/old";
const OLD_URL = `${CLOUD}/${OLD_ID}.jpg`;
const NEW_ID = "hm_visuals/media/photography/new";
const NEW_URL = `${CLOUD}/${NEW_ID}.jpg`;

const photo = { title: "Dune", categories: ["photography"], tags: [], peopleIds: [], appearances: [], type: "image" };
const hide = { ...photo, isPublic: false };

let media: Record<string, unknown> & { _id: ObjectId };

function seed({ heroUrl = OLD_URL, item = {} as Record<string, unknown> } = {}) {
  media = {
    _id: new ObjectId(),
    type: "image",
    title: "Dune",
    categories: ["photography"],
    secureUrl: OLD_URL,
    publicId: OLD_ID,
    resourceType: "image",
    isPublic: true,
    ...item,
  };
  resetMemoryDb({
    media: [media],
    page_sections: [{ slug: "home", data: { hero: { images: [{ url: heroUrl, publicId: "" }] } } }],
    page_seo: [],
    blog_posts: [],
    private_galleries: [],
  });
}

const heroUrl = () => (memory.collections.page_sections![0]!.data as { hero: { images: { url: string }[] } }).hero.images[0]!.url;
const edit = (body: Record<string, unknown>) =>
  patch(new Request("http://localhost/api/media/x", { method: "PATCH", body: JSON.stringify(body) }), {
    params: Promise.resolve({ id: String(media._id) }),
  });

beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  seed();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("PATCH /api/media/[id] — hiding an item a page uses", () => {
  test("asks first, offering only to remove it from those places; nothing is written", async () => {
    const res = await edit(hide);

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      code: "MEDIA_IN_USE",
      hides: true,
      canReplace: false,
      items: [{ title: "Dune", usedOn: ["Home — hero photo 1"] }],
    });
    expect(media.isPublic).toBe(true);
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("usages=remove empties those places, hides the item and makes its file private", async () => {
    const res = await edit({ ...hide, usages: "remove" });

    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(media).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
    expect(deleteStoredMediaAsset).not.toHaveBeenCalled();
  });

  test("usages=replace is refused while hiding", async () => {
    expect((await edit({ ...hide, usages: "replace" })).status).toBe(400);
  });

  test("a page that could not be cleared keeps the file public and is named", async () => {
    memory.failWritesTo.add("page_sections");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await edit({ ...hide, usages: "remove" });

    expect(await res.json()).toMatchObject({ ok: true, pagesNotUpdated: ["Home — hero photo 1"] });
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/media/[id] — the file follows the item's visibility", () => {
  test("hiding an unused item makes its file private with no question", async () => {
    seed({ heroUrl: "" });

    const res = await edit(hide);

    expect(res.status).toBe(200);
    expect(media.deliveryType).toBe("authenticated");
    expect(convertAssetDeliveryType).toHaveBeenCalledWith(expect.objectContaining({ from: "upload", to: "authenticated" }));
  });

  test("making a hidden item public puts its file back on public delivery", async () => {
    seed({ heroUrl: "", item: { isPublic: false, deliveryType: "authenticated" } });

    const res = await edit({ ...photo, isPublic: true });

    expect(res.status).toBe(200);
    expect(media).toMatchObject({ isPublic: true, deliveryType: "upload" });
  });

  test("a new file for a hidden item is made private, and the old private file is deleted as private", async () => {
    seed({ heroUrl: "", item: { isPublic: false, deliveryType: "authenticated" } });

    const res = await edit({ ...hide, secureUrl: NEW_URL, publicId: NEW_ID, resourceType: "image" });

    expect(res.status).toBe(200);
    expect(media).toMatchObject({ publicId: NEW_ID, deliveryType: "authenticated" });
    expect(convertAssetDeliveryType).toHaveBeenCalledWith(expect.objectContaining({ publicId: NEW_ID, from: "upload" }));
    expect(deleteStoredMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ publicId: OLD_ID, deliveryType: "authenticated" }));
  });

  test("a file that could not be switched is reported", async () => {
    seed({ heroUrl: "" });
    convertAssetDeliveryType.mockResolvedValueOnce({ ok: false, error: "Rate limited" } as never);

    const res = await edit(hide);

    expect((await res.json()).deliveryError).toBe(
      "“Dune” is hidden, but its file could not be made private (Rate limited). Save again to retry."
    );
  });
});

describe("POST /api/media/create", () => {
  test("a new hidden upload is made private before the reply", async () => {
    resetMemoryDb({ media: [], private_galleries: [] });

    const res = await create(
      new Request("http://localhost/api/media/create", {
        method: "POST",
        body: JSON.stringify({ ...hide, secureUrl: NEW_URL, publicId: NEW_ID, resourceType: "image" }),
      })
    );

    expect(res.status).toBe(200);
    expect(memory.collections.media![0]).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });

  test("a new public upload stays on public delivery", async () => {
    resetMemoryDb({ media: [], private_galleries: [] });

    await create(
      new Request("http://localhost/api/media/create", {
        method: "POST",
        body: JSON.stringify({ ...photo, secureUrl: NEW_URL, publicId: NEW_ID, resourceType: "image" }),
      })
    );

    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });
});
