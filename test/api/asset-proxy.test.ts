import { ObjectId } from "mongodb";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const {
  cookieStore,
  galleryFindOne,
  mediaFindOne,
  isAdminAuthedServer,
  consumeFixedWindowRateLimit,
  signedDeliveryUrl,
} = vi.hoisted(() => ({
  cookieStore: new Map<string, string>(),
  galleryFindOne: vi.fn(),
  mediaFindOne: vi.fn(),
  isAdminAuthedServer: vi.fn(),
  consumeFixedWindowRateLimit: vi.fn(),
  signedDeliveryUrl: vi.fn(),
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
    collection: (name: string) => ({
      findOne: name === "private_galleries" ? galleryFindOne : mediaFindOne,
    }),
  }),
}));

vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer }));

vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit }));

vi.mock("@/lib/server/cloudinary-private", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/cloudinary-private")>()),
  signedDeliveryUrl,
}));

import { createPrivateGalleryCookieValue, privateGalleryCookieName } from "@/lib/private-galleries";
import { GET } from "@/app/api/media/asset/[mediaId]/route";

const MEDIA_ID = "507f1f77bcf86cd799439011";
const OTHER_MEDIA_ID = "507f1f77bcf86cd799439022";
const GALLERY_A_ID = "6650a1b2c3d4e5f601020304";
const GALLERY_B_ID = "6650a1b2c3d4e5f601020305";

function galleryDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(GALLERY_A_ID),
    slug: "gallery-a",
    accessToken: "token-a",
    mediaIds: [MEDIA_ID],
    isActive: true,
    expiresAt: new Date(Date.now() + 86_400_000),
    ...overrides,
  };
}

function unlock(galleryId: string, accessToken: string) {
  const value = createPrivateGalleryCookieValue(galleryId, accessToken);
  cookieStore.set(privateGalleryCookieName(galleryId), value as string);
}

function request(path: string, init?: RequestInit) {
  return new Request(`https://hm.test${path}`, init);
}

function ctx(mediaId: string) {
  return { params: Promise.resolve({ mediaId }) };
}

beforeAll(() => {
  process.env.PRIVATE_GALLERY_COOKIE_SECRET = "test-gallery-secret";
});

beforeEach(() => {
  cookieStore.clear();
  isAdminAuthedServer.mockResolvedValue(false);
  consumeFixedWindowRateLimit.mockResolvedValue({ limited: false });
  signedDeliveryUrl.mockReturnValue("https://res.cloudinary.test/signed.jpg");
  galleryFindOne.mockResolvedValue(galleryDoc());
  mediaFindOne.mockResolvedValue({
    _id: new ObjectId(MEDIA_ID),
    publicId: "hm_visuals/media/photo",
    resourceType: "image",
    deliveryType: "authenticated",
  });

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("bytes", { status: 200, headers: { "content-type": "image/jpeg" } }))
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("GET /api/media/asset/[mediaId] — authorization", () => {
  test("404s a malformed media id before touching the database", async () => {
    const res = await GET(request("/api/media/asset/nope?g=gallery-a"), ctx("nope"));

    expect(res.status).toBe(404);
    expect(galleryFindOne).not.toHaveBeenCalled();
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("403s an anonymous request with no gallery slug", async () => {
    const res = await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("403s when the gallery cookie is missing", async () => {
    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("serves the asset with a valid cookie for a member item", async () => {
    unlock(GALLERY_A_ID, "token-a");

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=300");
  });

  test("403s an item that is not a member of the unlocked gallery", async () => {
    unlock(GALLERY_A_ID, "token-a");

    const res = await GET(
      request(`/api/media/asset/${OTHER_MEDIA_ID}?g=gallery-a`),
      ctx(OTHER_MEDIA_ID)
    );

    expect(res.status).toBe(403);
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("gallery A's cookie cannot fetch gallery B's asset", async () => {
    unlock(GALLERY_A_ID, "token-a");
    galleryFindOne.mockResolvedValue(
      galleryDoc({
        _id: new ObjectId(GALLERY_B_ID),
        slug: "gallery-b",
        accessToken: "token-b",
        mediaIds: [MEDIA_ID],
      })
    );

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-b`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("a rotated access token invalidates an already-issued cookie", async () => {
    unlock(GALLERY_A_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ accessToken: "token-rotated" }));

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
  });

  test("403s an expired gallery even with a valid cookie", async () => {
    unlock(GALLERY_A_ID, "token-a");
    galleryFindOne.mockResolvedValue(
      galleryDoc({ expiresAt: new Date(Date.now() - 1_000) })
    );

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
  });

  test("403s a deactivated gallery even with a valid cookie", async () => {
    unlock(GALLERY_A_ID, "token-a");
    galleryFindOne.mockResolvedValue(galleryDoc({ isActive: false }));

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
  });

  test("403s an unknown gallery slug", async () => {
    unlock(GALLERY_A_ID, "token-a");
    galleryFindOne.mockResolvedValue(null);

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=ghost`), ctx(MEDIA_ID));

    expect(res.status).toBe(403);
  });

  test("429s an anonymous request over the rate limit before any gallery lookup", async () => {
    consumeFixedWindowRateLimit.mockResolvedValue({ limited: true });

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}?g=gallery-a`), ctx(MEDIA_ID));

    expect(res.status).toBe(429);
    expect(galleryFindOne).not.toHaveBeenCalled();
  });

  test("an admin session serves the asset without a gallery slug or cookie", async () => {
    isAdminAuthedServer.mockResolvedValue(true);

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));

    expect(res.status).toBe(200);
    expect(consumeFixedWindowRateLimit).not.toHaveBeenCalled();
    expect(galleryFindOne).not.toHaveBeenCalled();
  });
});

describe("GET /api/media/asset/[mediaId] — delivery", () => {
  beforeEach(() => {
    isAdminAuthedServer.mockResolvedValue(true);
  });

  test("clamps ?w= into the 16-3840 range", async () => {
    await GET(request(`/api/media/asset/${MEDIA_ID}?w=99999`), ctx(MEDIA_ID));
    expect(signedDeliveryUrl).toHaveBeenLastCalledWith(expect.objectContaining({ width: 3840 }));

    await GET(request(`/api/media/asset/${MEDIA_ID}?w=1`), ctx(MEDIA_ID));
    expect(signedDeliveryUrl).toHaveBeenLastCalledWith(expect.objectContaining({ width: 16 }));

    await GET(request(`/api/media/asset/${MEDIA_ID}?w=640`), ctx(MEDIA_ID));
    expect(signedDeliveryUrl).toHaveBeenLastCalledWith(expect.objectContaining({ width: 640 }));
  });

  test("passes a null width through when ?w= is absent or unparseable", async () => {
    await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));
    expect(signedDeliveryUrl).toHaveBeenLastCalledWith(expect.objectContaining({ width: null }));

    await GET(request(`/api/media/asset/${MEDIA_ID}?w=wide`), ctx(MEDIA_ID));
    expect(signedDeliveryUrl).toHaveBeenLastCalledWith(expect.objectContaining({ width: null }));
  });

  test("signs with the stored delivery and resource type", async () => {
    mediaFindOne.mockResolvedValue({
      _id: new ObjectId(MEDIA_ID),
      publicId: "hm_visuals/media/clip",
      resourceType: "video",
      deliveryType: "authenticated",
    });

    await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));

    expect(signedDeliveryUrl).toHaveBeenCalledWith({
      publicId: "hm_visuals/media/clip",
      resourceType: "video",
      deliveryType: "authenticated",
      width: null,
    });
  });

  test("forwards Range and passes a 206 with Content-Range through", async () => {
    const upstream = vi.fn(
      async () =>
        new Response("partial", {
          status: 206,
          headers: { "content-range": "bytes 0-99/500", "content-type": "video/mp4" },
        })
    );
    vi.stubGlobal("fetch", upstream);

    const res = await GET(
      request(`/api/media/asset/${MEDIA_ID}`, { headers: { Range: "bytes=0-99" } }),
      ctx(MEDIA_ID)
    );

    expect(upstream).toHaveBeenCalledWith(
      "https://res.cloudinary.test/signed.jpg",
      expect.objectContaining({ headers: { Range: "bytes=0-99" } })
    );
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe("bytes 0-99/500");
    expect(res.headers.get("accept-ranges")).toBe("bytes");
  });

  test("502s when Cloudinary refuses the signed URL", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));

    expect(res.status).toBe(502);
  });

  test("404s media that is missing or has no public id", async () => {
    mediaFindOne.mockResolvedValueOnce(null);
    expect((await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID))).status).toBe(404);

    mediaFindOne.mockResolvedValueOnce({ _id: new ObjectId(MEDIA_ID), publicId: "  " });
    expect((await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID))).status).toBe(404);
  });

  test("500s when Cloudinary is not configured", async () => {
    signedDeliveryUrl.mockImplementation(() => {
      throw new Error("Cloudinary is not configured");
    });

    const res = await GET(request(`/api/media/asset/${MEDIA_ID}`), ctx(MEDIA_ID));

    expect(res.status).toBe(500);
  });
});
