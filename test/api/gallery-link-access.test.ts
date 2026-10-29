import { ObjectId } from "mongodb";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { cookieStore, galleryFindOne, mediaFindOne, mediaFind, consumeFixedWindowRateLimit, cloudinary } = vi.hoisted(
  () => ({
    cookieStore: new Map<string, string>(),
    galleryFindOne: vi.fn(),
    mediaFindOne: vi.fn(),
    mediaFind: vi.fn(),
    consumeFixedWindowRateLimit: vi.fn(),
    cloudinary: {
      signedDeliveryUrl: vi.fn(() => "https://res.cloudinary.test/signed.jpg"),
      expiringDownloadUrl: vi.fn(() => ({ url: "https://api.cloudinary.test/download", expiresAt: 1 })),
      expiringArchiveUrl: vi.fn(() => "https://api.cloudinary.test/archive.zip"),
    },
  })
);

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
      name === "private_galleries" ? { findOne: galleryFindOne } : { findOne: mediaFindOne, find: mediaFind },
  }),
}));

vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => false }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit, fixedWindowCount: async () => 0 }));
vi.mock("@/lib/server/cloudinary-private", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/cloudinary-private")>()),
  ...cloudinary,
}));

import {
  createPrivateGalleryCookieValue,
  makeGalleryLinkKey,
  privateGalleryCookieName,
} from "@/lib/private-galleries";
import { GET as getAsset } from "@/app/api/media/asset/[mediaId]/route";
import { POST as postDownloadUrl } from "@/app/api/private-galleries/download-url/route";
import { GET as getZip } from "@/app/api/private-galleries/download/[slug]/route";
import { LINK_DOWNLOADS_USED_UP_TEXT } from "@/lib/server/gallery-link-limits";
import { getLinkGalleryPublic } from "@/lib/server/private-galleries";

const MEDIA_ID = "507f1f77bcf86cd799439011";
const OTHER_MEDIA_ID = "507f1f77bcf86cd799439022";
const GALLERY_ID = "6650a1b2c3d4e5f601020304";
const KEY = makeGalleryLinkKey();

function linkGallery(overrides: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(GALLERY_ID),
    slug: "vogue",
    visibility: "public",
    linkKey: KEY,
    passwordHash: null,
    accessToken: "token-a",
    mediaIds: [MEDIA_ID, "507f1f77bcf86cd799439033"],
    isActive: true,
    expiresAtUtc: new Date(Date.now() + 86_400_000),
    ...overrides,
  };
}

const mediaDoc = {
  _id: new ObjectId(MEDIA_ID),
  publicId: "hm_visuals/media/photo",
  secureUrl: "https://res.cloudinary.com/demo/image/authenticated/s--x--/v1/hm_visuals/media/photo.jpg",
  resourceType: "image",
  deliveryType: "authenticated",
};

const asset = (query: string, mediaId = MEDIA_ID) =>
  getAsset(new Request(`https://hm.test/api/media/asset/${mediaId}?${query}`), {
    params: Promise.resolve({ mediaId }),
  });

const downloadUrl = (body: Record<string, unknown>) =>
  postDownloadUrl(
    new Request("https://hm.test/api/private-galleries/download-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );

const zip = (query: string) =>
  getZip(new Request(`https://hm.test/api/private-galleries/download/vogue?${query}`), {
    params: Promise.resolve({ slug: "vogue" }),
  });

function limitOn(bucket: string, at = 1) {
  consumeFixedWindowRateLimit.mockImplementation(async (params: { bucket: string; amount?: number }) => ({
    limited: params.bucket === bucket,
    count: params.amount ?? at,
  }));
}

beforeAll(() => {
  process.env.PRIVATE_GALLERY_COOKIE_SECRET = "test-gallery-secret";
});

beforeEach(() => {
  cookieStore.clear();
  consumeFixedWindowRateLimit.mockResolvedValue({ limited: false, count: 1 });
  galleryFindOne.mockResolvedValue(linkGallery());
  mediaFindOne.mockResolvedValue(mediaDoc);
  mediaFind.mockReturnValue({
    toArray: async () => [mediaDoc, { ...mediaDoc, _id: new ObjectId("507f1f77bcf86cd799439033"), publicId: "b" }],
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

describe("file route — public galleries", () => {
  test("the right key serves the file, cached a day in the visitor's browser only", async () => {
    const res = await asset(`g=vogue&k=${KEY}&w=640`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=86400");
    expect(cloudinary.signedDeliveryUrl).toHaveBeenCalledWith(expect.objectContaining({ width: 640 }));
  });

  test("counts each view against the link, keyed by a hash and never the key itself", async () => {
    await asset(`g=vogue&k=${KEY}`);
    const view = consumeFixedWindowRateLimit.mock.calls.find(([p]) => p.bucket === "gallery-link-view")?.[0];
    expect(view).toMatchObject({ limit: 200, windowMs: 86_400_000 });
    expect(view.key).toMatch(new RegExp(`^${GALLERY_ID}:[a-f0-9]{16}$`));
    expect(view.key).not.toContain(KEY);
  });

  test.each([
    ["no key", "g=vogue"],
    ["a wrong key", `g=vogue&k=${makeGalleryLinkKey()}`],
    ["a malformed key", "g=vogue&k=../../etc"],
    ["an oversized key", `g=vogue&k=${"a".repeat(5000)}`],
  ])("403s %s without loading the file", async (_name, query) => {
    const res = await asset(query);
    expect(res.status).toBe(403);
    expect(mediaFindOne).not.toHaveBeenCalled();
  });

  test("403s a replaced link (the stored key changed)", async () => {
    galleryFindOne.mockResolvedValue(linkGallery({ linkKey: makeGalleryLinkKey() }));
    expect((await asset(`g=vogue&k=${KEY}`)).status).toBe(403);
  });

  test("403s an expired or switched-off link", async () => {
    galleryFindOne.mockResolvedValue(linkGallery({ expiresAtUtc: new Date(Date.now() - 1000) }));
    expect((await asset(`g=vogue&k=${KEY}`)).status).toBe(403);
    galleryFindOne.mockResolvedValue(linkGallery({ isActive: false }));
    expect((await asset(`g=vogue&k=${KEY}`)).status).toBe(403);
  });

  test("403s media that is not in the gallery", async () => {
    expect((await asset(`g=vogue&k=${KEY}`, OTHER_MEDIA_ID)).status).toBe(403);
  });

  test("a gallery cookie never opens a public gallery", async () => {
    cookieStore.set(privateGalleryCookieName(GALLERY_ID), createPrivateGalleryCookieValue(GALLERY_ID, "token-a")!);
    expect((await asset("g=vogue")).status).toBe(403);
  });

  test("a key never opens a private gallery", async () => {
    galleryFindOne.mockResolvedValue(linkGallery({ visibility: undefined, linkKey: KEY }));
    expect((await asset(`g=vogue&k=${KEY}`)).status).toBe(403);
  });

  test("429s once the link's views for the day are used up", async () => {
    limitOn("gallery-link-view");
    const res = await asset(`g=vogue&k=${KEY}`);
    expect(res.status).toBe(429);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("a private gallery keeps its short cache and is not counted per link", async () => {
    galleryFindOne.mockResolvedValue(linkGallery({ visibility: undefined, linkKey: undefined }));
    cookieStore.set(privateGalleryCookieName(GALLERY_ID), createPrivateGalleryCookieValue(GALLERY_ID, "token-a")!);
    const res = await asset("g=vogue");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=300");
    expect(consumeFixedWindowRateLimit.mock.calls.map(([p]) => p.bucket)).toEqual(["gallery-asset"]);
  });
});

describe("single download — public galleries", () => {
  test("the right key gets a 5-minute download address and counts one download", async () => {
    const res = await downloadUrl({ slug: "vogue", mediaId: MEDIA_ID, key: KEY });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, url: "https://api.cloudinary.test/download" });
    const count = consumeFixedWindowRateLimit.mock.calls.find(([p]) => p.bucket === "gallery-link-download")?.[0];
    expect(count).toMatchObject({ amount: 1, limit: 10 });
  });

  test("403s a wrong key and 404s media outside the gallery", async () => {
    expect((await downloadUrl({ slug: "vogue", mediaId: MEDIA_ID, key: makeGalleryLinkKey() })).status).toBe(403);
    expect((await downloadUrl({ slug: "vogue", mediaId: OTHER_MEDIA_ID, key: KEY })).status).toBe(404);
    expect(cloudinary.expiringDownloadUrl).not.toHaveBeenCalled();
  });

  test("says so in words once the link's downloads are used up", async () => {
    limitOn("gallery-link-download");
    const res = await downloadUrl({ slug: "vogue", mediaId: MEDIA_ID, key: KEY });
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ error: LINK_DOWNLOADS_USED_UP_TEXT });
  });

  test("400s a body that is not an object", async () => {
    const res = await postDownloadUrl(
      new Request("https://hm.test/api/private-galleries/download-url", { method: "POST", body: "[1]" })
    );
    expect(res.status).toBe(400);
  });
});

describe("ZIP — public galleries", () => {
  test("format=json answers the archive address and counts every file in it", async () => {
    const res = await zip(`k=${KEY}&format=json`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, url: "https://api.cloudinary.test/archive.zip" });
    const count = consumeFixedWindowRateLimit.mock.calls.find(([p]) => p.bucket === "gallery-link-download")?.[0];
    expect(count).toMatchObject({ amount: 2 });
  });

  test("without format=json it still redirects to the archive", async () => {
    const res = await zip(`k=${KEY}`);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://api.cloudinary.test/archive.zip");
  });

  test("403s a wrong key in both forms", async () => {
    expect((await zip(`k=${makeGalleryLinkKey()}&format=json`)).status).toBe(403);
    expect((await zip(`k=${makeGalleryLinkKey()}`)).status).toBe(403);
    expect(cloudinary.expiringArchiveUrl).not.toHaveBeenCalled();
  });

  test("says so in words once the link's downloads are used up", async () => {
    limitOn("gallery-link-download");
    const res = await zip(`k=${KEY}&format=json`);
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ ok: false, error: LINK_DOWNLOADS_USED_UP_TEXT });
  });
});

describe("public gallery page — where each photo loads from", () => {
  test("a public photo loads from Cloudinary; a hidden one through the site with the key", async () => {
    const publicPhoto = {
      _id: new ObjectId("507f1f77bcf86cd799439033"),
      publicId: "hm_visuals/media/public-photo",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/public-photo.jpg",
      deliveryType: "upload",
    };
    mediaFind.mockReturnValue({ toArray: async () => [mediaDoc, publicPhoto] });

    const result = await getLinkGalleryPublic("vogue", KEY);
    if (result.state !== "open") throw new Error("expected the gallery to open");

    const byId = new Map(result.gallery.mediaItems.map((item) => [item.id, item.secureUrl]));
    expect(byId.get(MEDIA_ID)).toBe(`/api/media/asset/${MEDIA_ID}?g=vogue&k=${KEY}`);
    expect(byId.get("507f1f77bcf86cd799439033")).toBe(publicPhoto.secureUrl);
  });

  test("a wrong key or a private gallery shows nothing", async () => {
    expect((await getLinkGalleryPublic("vogue", makeGalleryLinkKey())).state).toBe("missing");
    galleryFindOne.mockResolvedValue(linkGallery({ visibility: undefined }));
    expect((await getLinkGalleryPublic("vogue", KEY)).state).toBe("missing");
  });
});
