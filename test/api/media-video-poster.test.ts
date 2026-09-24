import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";

const { storeVideoPoster, deleteVideoPoster, discardUnsavedPoster, writeLog } = vi.hoisted(() => ({
  storeVideoPoster: vi.fn(),
  deleteVideoPoster: vi.fn(),
  discardUnsavedPoster: vi.fn(),
  writeLog: [] as string[],
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces: vi.fn() }));
vi.mock("@/lib/server/video-posters", () => ({ storeVideoPoster, deleteVideoPoster, discardUnsavedPoster }));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  getPrivateGalleryTitlesForMedia: async () => [],
  findPrivateGalleriesUsingMedia: async () => [],
  formatPrivateGalleryMediaDeleteBlocker: () => "",
}));
vi.mock("@/lib/server/media-asset-management", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/media-asset-management")>(
    "@/lib/server/media-asset-management"
  );
  return { ...actual, deleteStoredMediaAsset: vi.fn(), moveStoredMediaAssetToFolder: vi.fn() };
});

type Doc = Record<string, unknown> & { _id: ObjectId };
let media: Doc[] = [];
let failWrites = false;

function matches(doc: Doc, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    const value = doc[key];
    if (cond instanceof RegExp) return typeof value === "string" && cond.test(value);
    if (cond instanceof ObjectId) return value instanceof ObjectId && value.equals(cond);
    if (cond && typeof cond === "object" && "$ne" in cond) {
      const ne = (cond as { $ne: unknown }).$ne;
      return !(ne instanceof ObjectId && value instanceof ObjectId && value.equals(ne));
    }
    return value === cond;
  });
}

const mediaCollection = {
  findOne: async (filter: Record<string, unknown>) => {
    const doc = media.find((entry) => matches(entry, filter));
    return doc ? { ...doc } : null;
  },
  updateOne: async (
    filter: Record<string, unknown>,
    update: { $set?: Record<string, unknown>; $setOnInsert?: Record<string, unknown> },
    options?: { upsert?: boolean }
  ) => {
    writeLog.push("media.updateOne");
    if (failWrites) return { matchedCount: 0 };
    let doc = media.find((entry) => matches(entry, filter));
    if (!doc && options?.upsert) {
      doc = { _id: new ObjectId(), ...filter, ...update.$setOnInsert };
      media.push(doc);
    }
    if (!doc) return { matchedCount: 0 };
    Object.assign(doc, update.$set);
    return { matchedCount: 1 };
  },
  deleteOne: async (filter: Record<string, unknown>) => {
    const index = media.findIndex((doc) => matches(doc, filter));
    if (index >= 0) media.splice(index, 1);
    return { deletedCount: index >= 0 ? 1 : 0 };
  },
};

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: (name: string) =>
      name === "media" ? mediaCollection : { findOne: async () => null, find: () => ({ toArray: async () => [] }) },
  }),
}));

import { POST as create } from "@/app/api/media/create/route";
import { DELETE as remove, GET as read, PATCH as patch } from "@/app/api/media/[id]/route";

const YT_A = "Or18TXg2bnY";
const YT_B = "QLEzDzb-cJU";
const srcOf = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
const OLD_POSTER = { url: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/posters/old.jpg", publicId: "hm_visuals/media/posters/old" };
const NEW_POSTER = { url: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/posters/new.jpg", publicId: "hm_visuals/media/posters/new" };

const base = { title: "Show", categories: ["videography"], tags: [], peopleIds: [], appearances: [] };

function json(body: Record<string, unknown>, method = "POST") {
  return new Request("http://localhost/api/media", { method, body: JSON.stringify(body) });
}

function ctx(id: ObjectId) {
  return { params: Promise.resolve({ id: String(id) }) };
}

function seed(extra: Record<string, unknown> = {}) {
  const doc: Doc = {
    _id: new ObjectId(),
    type: "embed",
    title: "Existing show",
    categories: ["videography"],
    embedUrl: srcOf(YT_A),
    posterUrl: OLD_POSTER.url,
    posterPublicId: OLD_POSTER.publicId,
    ...extra,
  };
  media.push(doc);
  return doc;
}

beforeEach(() => {
  media = [];
  failWrites = false;
  writeLog.length = 0;
  storeVideoPoster.mockImplementation(async () => {
    writeLog.push("storeVideoPoster");
    return NEW_POSTER;
  });
  deleteVideoPoster.mockImplementation(async () => {
    writeLog.push("deleteVideoPoster");
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("creating a video embed", () => {
  test("stores the video's thumbnail on the new item", async () => {
    const res = await create(json({ ...base, type: "embed", embedUrl: `https://youtu.be/${YT_A}?si=x` }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: expect.any(String) });
    expect(storeVideoPoster).toHaveBeenCalledWith(expect.anything(), { provider: "youtube", id: YT_A });
    expect(media[0]).toMatchObject({
      embedUrl: srcOf(YT_A),
      posterUrl: NEW_POSTER.url,
      posterPublicId: NEW_POSTER.publicId,
    });
  });

  test("still saves when the thumbnail can't be fetched, and says so", async () => {
    storeVideoPoster.mockResolvedValue(null);

    const res = await create(json({ ...base, type: "embed", embedUrl: `https://www.youtube.com/watch?v=${YT_A}` }));

    expect(await res.json()).toMatchObject({ ok: true, posterMissing: true });
    expect(media[0]).toMatchObject({ posterUrl: null, posterPublicId: null });
  });

  test("refuses a video already in the library instead of overwriting that item", async () => {
    const existing = seed();

    const res = await create(json({ ...base, title: "New title", type: "embed", embedUrl: `https://youtu.be/${YT_A}` }));

    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("This video is already in the library as “Existing show”.");
    expect(storeVideoPoster).not.toHaveBeenCalled();
    expect(media).toHaveLength(1);
    expect(existing.title).toBe("Existing show");
  });

  test("rejects a link that is not a YouTube or Vimeo video", async () => {
    const res = await create(json({ ...base, type: "embed", embedUrl: "https://example.com/video" }));

    expect(res.status).toBe(400);
    expect(storeVideoPoster).not.toHaveBeenCalled();
  });
});

describe("editing a video embed", () => {
  test("accepts the stored player link unchanged and keeps the existing thumbnail", async () => {
    const doc = seed();

    const res = await patch(json({ ...base, type: "embed", embedUrl: srcOf(YT_A) }, "PATCH"), ctx(doc._id));

    expect(res.status).toBe(200);
    expect(storeVideoPoster).not.toHaveBeenCalled();
    expect(deleteVideoPoster).not.toHaveBeenCalledWith(expect.any(String));
    expect(doc).toMatchObject({ posterUrl: OLD_POSTER.url, posterPublicId: OLD_POSTER.publicId });
  });

  test("fetches a thumbnail for an item saved before thumbnails existed", async () => {
    const doc = seed({ posterUrl: undefined, posterPublicId: undefined });

    const res = await patch(
      json({ ...base, type: "embed", embedUrl: `https://www.youtube.com/watch?v=${YT_A}` }, "PATCH"),
      ctx(doc._id)
    );

    expect(await res.json()).toEqual({ ok: true });
    expect(storeVideoPoster).toHaveBeenCalledTimes(1);
    expect(doc).toMatchObject({ posterUrl: NEW_POSTER.url, posterPublicId: NEW_POSTER.publicId });
    expect(deleteVideoPoster).not.toHaveBeenCalledWith(expect.any(String));
  });

  test("replaces the thumbnail when the video changes, deleting the old one only after saving", async () => {
    const doc = seed();

    await patch(json({ ...base, type: "embed", embedUrl: `https://youtu.be/${YT_B}` }, "PATCH"), ctx(doc._id));

    expect(doc).toMatchObject({ embedUrl: srcOf(YT_B), posterPublicId: NEW_POSTER.publicId });
    expect(deleteVideoPoster).toHaveBeenCalledWith(OLD_POSTER.publicId);
    expect(writeLog).toEqual(["storeVideoPoster", "media.updateOne", "deleteVideoPoster"]);
  });

  test("refuses a video another item already uses", async () => {
    seed({ embedUrl: srcOf(YT_B), title: "Other show" });
    const doc = seed();

    const res = await patch(json({ ...base, type: "embed", embedUrl: `https://youtu.be/${YT_B}` }, "PATCH"), ctx(doc._id));

    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("This video is already in the library as “Other show”.");
    expect(storeVideoPoster).not.toHaveBeenCalled();
    expect(doc.embedUrl).toBe(srcOf(YT_A));
  });

  test("clears and deletes the thumbnail when the item switches to an uploaded video", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    const doc = seed();
    const publicId = "hm_visuals/media/videography/clip";

    const res = await patch(
      json(
        {
          ...base,
          type: "video",
          secureUrl: `https://res.cloudinary.com/demo/video/upload/v1/${publicId}.mp4`,
          publicId,
          resourceType: "video",
        },
        "PATCH"
      ),
      ctx(doc._id)
    );

    expect(res.status).toBe(200);
    expect(doc).toMatchObject({ type: "video", embedUrl: null, posterUrl: null, posterPublicId: null });
    expect(deleteVideoPoster).toHaveBeenCalledWith(OLD_POSTER.publicId);
  });

  test("discards the new thumbnail and keeps the old one when the save doesn't land", async () => {
    const doc = seed();
    failWrites = true;

    const res = await patch(json({ ...base, type: "embed", embedUrl: `https://youtu.be/${YT_B}` }, "PATCH"), ctx(doc._id));

    expect(res.status).toBe(404);
    expect(discardUnsavedPoster).toHaveBeenCalledWith(expect.anything(), NEW_POSTER.publicId);
    expect(deleteVideoPoster).not.toHaveBeenCalled();
  });
});

describe("reading and deleting", () => {
  test("the editor receives the thumbnail", async () => {
    const doc = seed();

    const res = await read(new Request("http://localhost"), ctx(doc._id));

    expect((await res.json()).item).toMatchObject({ embedUrl: srcOf(YT_A), posterUrl: OLD_POSTER.url });
  });

  test("deleting the item deletes its thumbnail", async () => {
    const doc = seed();

    const res = await remove(new Request("http://localhost", { method: "DELETE" }), ctx(doc._id));

    expect(res.status).toBe(200);
    expect(deleteVideoPoster).toHaveBeenCalledWith(OLD_POSTER.publicId);
  });
});
