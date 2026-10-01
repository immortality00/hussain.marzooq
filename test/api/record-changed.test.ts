import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";
import { EXPECTED_VERSION_HEADER, RECORD_CHANGED } from "@/lib/record-changed";

const { moveStoredMediaAssetToFolder } = vi.hoisted(() => ({ moveStoredMediaAssetToFolder: vi.fn() }));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null, isAdminAuthedServer: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces: vi.fn(), revalidateSitePages: vi.fn() }));
vi.mock("@/lib/server/video-posters", () => ({
  storeVideoPoster: async () => null,
  deleteVideoPoster: vi.fn(),
  discardUnsavedPoster: vi.fn(),
}));
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

import { PATCH as patchMedia } from "@/app/api/media/[id]/route";
import { PATCH as patchSeo } from "@/app/api/admin/page-seo/[slug]/route";

const SAVED_AT = new Date("2026-10-01T09:00:00.000Z");
const mediaId = new ObjectId();
const PUBLIC_ID = "hm_visuals/media/photography/frame";
const SECURE_URL = `https://res.cloudinary.com/demo/image/upload/v1/${PUBLIC_ID}.jpg`;

const photo = (overrides: Record<string, unknown> = {}) => ({
  title: "Frame",
  categories: ["photography"],
  tags: [],
  appearances: [],
  peopleIds: [],
  isPublic: true,
  type: "image",
  secureUrl: SECURE_URL,
  publicId: PUBLIC_ID,
  resourceType: "image",
  ...overrides,
});

function request(body: unknown, expected?: string) {
  return new Request("http://localhost/api/x", {
    method: "PATCH",
    headers: expected === undefined ? {} : { [EXPECTED_VERSION_HEADER]: expected },
    body: JSON.stringify(body),
  });
}

const mediaCtx = { params: Promise.resolve({ id: String(mediaId) }) };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo");
  moveStoredMediaAssetToFolder.mockReset();
  resetMemoryDb({
    media: [{ _id: mediaId, ...photo(), title: "Frame", updatedAt: SAVED_AT, createdAt: SAVED_AT }],
    page_seo: [{ _id: new ObjectId(), slug: "about", title: "About", updatedAt: SAVED_AT }],
  });
});

describe("saving a record changed on another device", () => {
  test("is refused with the current values when the record changed since it was opened", async () => {
    const res = await patchMedia(request(photo({ title: "Mine" }), "2026-09-30T00:00:00.000Z"), mediaCtx);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe(RECORD_CHANGED);
    expect(body.current.item.title).toBe("Frame");
    expect(body.current.item.updatedAt).toBe(SAVED_AT.toISOString());
    expect(memory.collections.media![0]!.title).toBe("Frame");
  });

  test("goes through when the version matches, and returns the new version", async () => {
    const res = await patchMedia(request(photo({ title: "Mine" }), SAVED_AT.toISOString()), mediaCtx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.title).toBe("Mine");
    expect(body.item.updatedAt).not.toBe(SAVED_AT.toISOString());
  });

  test("is not checked when no version is sent", async () => {
    const res = await patchMedia(request(photo({ title: "Mine" })), mediaCtx);
    expect(res.status).toBe(200);
  });

  test("treats a page that was never saved as version empty", async () => {
    const ctx = { params: Promise.resolve({ slug: "contact" }) };
    expect((await patchSeo(request({ title: "Contact" }, "") as never, ctx)).status).toBe(200);
    const again = await patchSeo(request({ title: "Contact again" }, "") as never, ctx);
    expect(again.status).toBe(409);
    expect((await again.json()).current.title).toBe("Contact");
  });
});

describe("moving a file to another category's folder", () => {
  test("reports Cloudinary's own reason when the move fails", async () => {
    moveStoredMediaAssetToFolder.mockRejectedValue({ error: { message: "Resource not found - frame" } });
    const res = await patchMedia(request(photo({ categories: ["art"] })), mediaCtx);
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe(
      "Could not move the media file to the selected category folder: Resource not found - frame"
    );
    expect(memory.collections.media![0]!.categories).toEqual(["photography"]);
  });
});
