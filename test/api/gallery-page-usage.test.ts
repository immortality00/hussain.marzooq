import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { makeMediaPrivateForGallery } = vi.hoisted(() => ({
  makeMediaPrivateForGallery: vi.fn(async () => ({ hidden: 0, converted: 0, missing: 0, failures: [] })),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  ensureUniquePrivateGallerySlug: async () => "client",
  serializePrivateGalleryAdminItem: (doc: Record<string, unknown>) => doc,
  validatePrivateGalleryMediaIds: async (_db: unknown, mediaIds: string[]) => ({ ok: true as const, mediaIds }),
}));
vi.mock("@/lib/server/private-gallery-assets", () => ({
  makeMediaPrivateForGallery,
  formatGalleryConversionError: () => "conversion failed",
}));

import { POST as createGallery } from "@/app/api/private-galleries/route";

const URL = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/dune.jpg";
const onPage = { _id: new ObjectId(), title: "Dune", publicId: "hm_visuals/media/photography/dune" };
const spare = { _id: new ObjectId(), title: "Spare", publicId: "hm_visuals/media/photography/spare" };

function save(extra: Record<string, unknown> = {}) {
  return createGallery(
    new Request("http://localhost/api/private-galleries", {
      method: "POST",
      body: JSON.stringify({
        title: "Client",
        password: "long-enough-password",
        expiresAtLocal: "2099-01-01T12:00",
        timezoneOffsetMinutes: 0,
        mediaIds: [String(onPage._id), String(spare._id)],
        ...extra,
      }),
    })
  );
}

const heroUrl = () => (memory.collections.page_sections![0]!.data as { hero: { image: { url: string } } }).hero.image.url;

beforeEach(() => {
  resetMemoryDb({
    media: [{ ...onPage }, { ...spare }],
    page_sections: [{ slug: "home", data: { hero: { image: { url: URL, publicId: "" } } } }],
    private_galleries: [],
  });
});

afterEach(() => vi.clearAllMocks());

describe("saving a private gallery with a photo a page uses", () => {
  test("is blocked before anything goes private, naming the photo and the place", async () => {
    const res = await save();

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      code: "MEDIA_IN_USE",
      items: [{ id: String(onPage._id), title: "Dune", usedOn: ["Home — hero"] }],
    });
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();
    expect(memory.collections.private_galleries).toHaveLength(0);
  });

  test("with clearPageUsages empties the place, then saves", async () => {
    const res = await save({ clearPageUsages: true });

    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(makeMediaPrivateForGallery).toHaveBeenCalledTimes(1);
    expect(memory.collections.private_galleries).toHaveLength(1);
  });

  test("a photo that is already private is not asked about again", async () => {
    memory.collections.media![0]!.deliveryType = "authenticated";

    expect((await save()).status).toBe(200);
    expect(heroUrl()).toBe(URL);
  });
});
