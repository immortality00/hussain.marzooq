import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Db } from "mongodb";

const { upload, registerAssetUpload, discardPendingUpload, deleteManagedCloudinaryAsset, configured } =
  vi.hoisted(() => ({
    upload: vi.fn(),
    registerAssetUpload: vi.fn(),
    discardPendingUpload: vi.fn(),
    deleteManagedCloudinaryAsset: vi.fn(),
    configured: { value: true },
  }));

vi.mock("cloudinary", () => ({ v2: { uploader: { upload } } }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => configured.value,
  ensureCloudinaryConfigured: () => ({}),
}));
vi.mock("@/lib/server/upload-ledger", () => ({
  newUploadPublicId: (folder: string) => `${folder}/poster1`,
  registerAssetUpload,
  discardPendingUpload,
}));
vi.mock("@/lib/server/cloudinary-assets", () => ({ deleteManagedCloudinaryAsset }));

import {
  deleteVideoPoster,
  fetchVideoPreview,
  storeVideoPoster,
} from "@/lib/server/video-posters";

const db = {} as Db;
const POSTER_ID = "hm_visuals/media/posters/poster1";
const YT = { provider: "youtube", id: "dQw4w9WgXcQ" } as const;
const VIMEO = { provider: "vimeo", id: "76979871", hash: null } as const;

type Route = { status?: number; body?: unknown; type?: string; bytes?: number };
let routes: Record<string, Route> = {};
const fetchMock = vi.fn(async (input: string | URL) => {
  const url = String(input);
  const route = Object.entries(routes).find(([prefix]) => url.startsWith(prefix))?.[1];
  if (!route) return new Response(null, { status: 404 });
  if (route.bytes !== undefined) {
    return new Response(new Uint8Array(route.bytes).fill(7), {
      status: route.status ?? 200,
      headers: { "content-type": route.type ?? "image/jpeg" },
    });
  }
  return new Response(route.body === undefined ? null : JSON.stringify(route.body), {
    status: route.status ?? 200,
    headers: { "content-type": route.type ?? "application/json" },
  });
});

function uploaded(publicId = POSTER_ID) {
  return {
    secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.jpg`,
    public_id: publicId,
    resource_type: "image",
    bytes: 1234,
  };
}

beforeEach(() => {
  routes = {};
  configured.value = true;
  upload.mockResolvedValue(uploaded());
  registerAssetUpload.mockResolvedValue(undefined);
  discardPendingUpload.mockResolvedValue("deleted");
  deleteManagedCloudinaryAsset.mockResolvedValue(true);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("storeVideoPoster — YouTube", () => {
  test("stores the HD thumbnail uncropped, registering the upload before it happens", async () => {
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"] = {};

    const poster = await storeVideoPoster(db, YT);

    expect(poster).toEqual({ url: uploaded().secure_url, publicId: POSTER_ID });
    expect(upload).toHaveBeenCalledWith(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      expect.not.objectContaining({ transformation: expect.anything() })
    );
    expect(upload.mock.calls[0][1]).toMatchObject({ public_id: POSTER_ID, resource_type: "image" });
    expect(registerAssetUpload).toHaveBeenCalledWith(db, POSTER_ID);
    expect(registerAssetUpload.mock.invocationCallOrder[0]).toBeLessThan(
      upload.mock.invocationCallOrder[0]
    );
  });

  test("falls back to the standard thumbnail when there is no HD one, cropping its letterbox bars", async () => {
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg"] = {};

    await storeVideoPoster(db, YT);

    expect(upload).toHaveBeenCalledWith(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg",
      expect.objectContaining({
        transformation: [{ aspect_ratio: "16:9", crop: "fill", gravity: "center" }],
      })
    );
  });

  test("returns null and uploads nothing when YouTube has no thumbnail", async () => {
    expect(await storeVideoPoster(db, YT)).toBeNull();
    expect(upload).not.toHaveBeenCalled();
    expect(registerAssetUpload).not.toHaveBeenCalled();
  });

  test("does nothing when Cloudinary is not configured", async () => {
    configured.value = false;

    expect(await storeVideoPoster(db, YT)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("storeVideoPoster — Vimeo", () => {
  test("stores the thumbnail Vimeo's oEmbed names", async () => {
    const thumb = "https://i.vimeocdn.com/video/145027281-abc-d_1280?region=us";
    routes["https://vimeo.com/api/oembed.json"] = { body: { title: "The Mountain", thumbnail_url: thumb } };

    await storeVideoPoster(db, VIMEO);

    expect(upload).toHaveBeenCalledWith(thumb, expect.objectContaining({ public_id: POSTER_ID }));
  });

  test("never hands Cloudinary a thumbnail from any other host", async () => {
    routes["https://vimeo.com/api/oembed.json"] = {
      body: { thumbnail_url: "https://internal.example/secret.jpg" },
    };

    expect(await storeVideoPoster(db, VIMEO)).toBeNull();
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("storeVideoPoster — failures never break the save", () => {
  beforeEach(() => {
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"] = {};
  });

  test("an upload error returns null and discards the pending upload", async () => {
    upload.mockRejectedValue({ error: { message: "Resource not found" } });

    expect(await storeVideoPoster(db, YT)).toBeNull();
    expect(discardPendingUpload).toHaveBeenCalledWith(db, POSTER_ID);
  });

  test("an empty placeholder asset is treated as a failure", async () => {
    upload.mockResolvedValue({ ...uploaded(), bytes: 0, placeholder: true });

    expect(await storeVideoPoster(db, YT)).toBeNull();
    expect(discardPendingUpload).toHaveBeenCalledWith(db, POSTER_ID);
  });

  test("an asset stored under a different id is treated as a failure", async () => {
    upload.mockResolvedValue(uploaded("hm_visuals/media/posters/other"));

    expect(await storeVideoPoster(db, YT)).toBeNull();
    expect(discardPendingUpload).toHaveBeenCalledWith(db, POSTER_ID);
  });
});

describe("fetchVideoPreview", () => {
  test("returns the video's title and a small inline preview", async () => {
    routes["https://www.youtube.com/oembed"] = { body: { title: "  Magda & Valeria show in ADIDF " } };
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"] = { bytes: 3 };

    const result = await fetchVideoPreview(YT);

    expect(result.title).toBe("Magda & Valeria show in ADIDF");
    expect(result.preview).toBe(`data:image/jpeg;base64,${Buffer.from([7, 7, 7]).toString("base64")}`);
  });

  test("still returns the preview when the title lookup fails", async () => {
    routes["https://www.youtube.com/oembed"] = { status: 401 };
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"] = { bytes: 3 };

    const result = await fetchVideoPreview(YT);

    expect(result.title).toBeNull();
    expect(result.preview).toMatch(/^data:image\/jpeg;base64,/);
  });

  test("refuses anything that is not a small image", async () => {
    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"] = { bytes: 3, type: "text/html" };
    expect((await fetchVideoPreview(YT)).preview).toBeNull();

    routes["https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"] = { bytes: 300_000 };
    expect((await fetchVideoPreview(YT)).preview).toBeNull();
  });
});

describe("deleteVideoPoster", () => {
  test("deletes only inside the posters folder", async () => {
    await deleteVideoPoster(POSTER_ID);

    expect(deleteManagedCloudinaryAsset).toHaveBeenCalledWith(
      { publicId: POSTER_ID, resourceType: "image" },
      ["hm_visuals/media/posters"]
    );
  });

  test("ignores a missing id", async () => {
    await deleteVideoPoster(undefined);
    await deleteVideoPoster("");

    expect(deleteManagedCloudinaryAsset).not.toHaveBeenCalled();
  });
});
