import { ObjectId } from "mongodb";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { cookieStore, galleryFindOne, mediaFindOne, mediaFind } = vi.hoisted(() => ({
  cookieStore: new Map<string, string>(),
  galleryFindOne: vi.fn(),
  mediaFindOne: vi.fn(),
  mediaFind: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: (name: string) =>
      name === "private_galleries"
        ? { findOne: galleryFindOne }
        : { findOne: mediaFindOne, find: mediaFind },
  }),
}));

import { createPrivateGalleryCookieValue, privateGalleryCookieName } from "@/lib/private-galleries";
import {
  findGalleryMedia,
  listGalleryMedia,
  openUnlockedGallery,
} from "@/app/api/private-galleries/_lib/gallery-access";

const GALLERY_ID = "6650a1b2c3d4e5f601020304";
const MEDIA_ID = "507f1f77bcf86cd799439011";
const OTHER_MEDIA_ID = "507f1f77bcf86cd799439022";

function galleryDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(GALLERY_ID),
    slug: "gallery-a",
    accessToken: "token-a",
    mediaIds: [MEDIA_ID],
    isActive: true,
    expiresAt: new Date(Date.now() + 86_400_000),
    ...overrides,
  };
}

function unlock(galleryId: string, accessToken: string) {
  cookieStore.set(
    privateGalleryCookieName(galleryId),
    createPrivateGalleryCookieValue(galleryId, accessToken) as string
  );
}

beforeAll(() => {
  process.env.PRIVATE_GALLERY_COOKIE_SECRET = "test-gallery-secret";
});

beforeEach(() => {
  cookieStore.clear();
  galleryFindOne.mockResolvedValue(galleryDoc());
  mediaFindOne.mockResolvedValue({ _id: new ObjectId(MEDIA_ID) });
  mediaFind.mockReturnValue({ toArray: async () => [{ _id: new ObjectId(MEDIA_ID) }] });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("openUnlockedGallery", () => {
  test("404s an unknown slug", async () => {
    galleryFindOne.mockResolvedValue(null);

    const result = await openUnlockedGallery("ghost");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(404);
  });

  test("403s an expired gallery", async () => {
    unlock(GALLERY_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ expiresAt: new Date(Date.now() - 1_000) }));

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(403);
  });

  test("403s a deactivated gallery", async () => {
    unlock(GALLERY_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ isActive: false }));

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(403);
  });

  test("403s when no cookie is present", async () => {
    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(403);
  });

  test("403s a cookie issued for a different gallery", async () => {
    unlock("6650a1b2c3d4e5f60102030f", "token-a");

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(403);
  });

  test("403s once the access token has been rotated", async () => {
    unlock(GALLERY_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ accessToken: "token-rotated" }));

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(false);
    expect((result as { response: Response }).response.status).toBe(403);
  });

  test("opens the gallery with a valid cookie and keeps only string media ids", async () => {
    unlock(GALLERY_ID, "token-a");
    galleryFindOne.mockResolvedValue(
      galleryDoc({ mediaIds: [MEDIA_ID, 42, null, OTHER_MEDIA_ID] })
    );

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(true);
    expect((result as { gallery: { mediaIds: string[] } }).gallery.mediaIds).toEqual([
      MEDIA_ID,
      OTHER_MEDIA_ID,
    ]);
  });

  test("tolerates a gallery document with no mediaIds array", async () => {
    unlock(GALLERY_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ mediaIds: undefined }));

    const result = await openUnlockedGallery("gallery-a");

    expect(result.ok).toBe(true);
    expect((result as { gallery: { mediaIds: string[] } }).gallery.mediaIds).toEqual([]);
  });
});

describe("findGalleryMedia — membership", () => {
  const gallery = { id: GALLERY_ID, slug: "gallery-a", mediaIds: [MEDIA_ID] };

  test("returns the document for a member id", async () => {
    await expect(findGalleryMedia(gallery, MEDIA_ID)).resolves.toEqual({
      _id: new ObjectId(MEDIA_ID),
    });
  });

  test("refuses an id that belongs to another gallery", async () => {
    await expect(findGalleryMedia(gallery, OTHER_MEDIA_ID)).resolves.toBeNull();
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("refuses a malformed id without querying", async () => {
    await expect(findGalleryMedia(gallery, "not-an-id")).resolves.toBeNull();
    expect(mediaFindOne).not.toHaveBeenCalled();
  });
});

describe("listGalleryMedia", () => {
  test("queries only the gallery's valid ObjectIds", async () => {
    await listGalleryMedia({
      id: GALLERY_ID,
      slug: "gallery-a",
      mediaIds: [MEDIA_ID, "garbage", OTHER_MEDIA_ID],
    });

    expect(mediaFind).toHaveBeenCalledWith({
      _id: { $in: [new ObjectId(MEDIA_ID), new ObjectId(OTHER_MEDIA_ID)] },
    });
  });

  test("short-circuits an empty membership list without querying", async () => {
    await expect(
      listGalleryMedia({ id: GALLERY_ID, slug: "gallery-a", mediaIds: [] })
    ).resolves.toEqual([]);
    expect(mediaFind).not.toHaveBeenCalled();
  });
});
