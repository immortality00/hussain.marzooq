import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const OID = "507f1f77bcf86cd799439011";

const { updateOne, insertOne, storedDoc, makeMediaPrivateForGallery, releaseMediaFromPrivateGalleries, resolveGalleryPageUsage } = vi.hoisted(() => ({
  updateOne: vi.fn<(filter: unknown, update: { $set: Record<string, unknown> }) => Promise<{ matchedCount: number }>>(
    async () => ({ matchedCount: 1 })
  ),
  insertOne: vi.fn<(doc: Record<string, unknown>) => Promise<{ insertedId: string }>>(async () => ({
    insertedId: "507f1f77bcf86cd799439099",
  })),
  storedDoc: {} as Record<string, unknown>,
  makeMediaPrivateForGallery: vi.fn(async () => ({ failures: [] })),
  releaseMediaFromPrivateGalleries: vi.fn<(db: unknown, ids: string[]) => Promise<void>>(async () => undefined),
  resolveGalleryPageUsage: vi.fn(async () => null),
}));

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({ collection: () => ({ updateOne, insertOne, findOne: async () => storedDoc }) }),
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("@/app/api/_lib/admin-route", () => ({
  requireAdminObjectId: async () => ({ id: OID, oid: new ObjectId(OID) }),
  findByIdOr404: async () => ({ doc: storedDoc }),
}));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  ensureUniquePrivateGallerySlug: async () => "vogue",
  serializePrivateGalleryAdminItem: (doc: Record<string, unknown>) => doc,
  validatePrivateGalleryMediaIds: async (_db: unknown, ids: string[]) => ({ ok: true as const, mediaIds: ids }),
}));
vi.mock("@/app/api/private-galleries/_lib/gallery-page-usage", () => ({ resolveGalleryPageUsage }));
vi.mock("@/lib/server/private-gallery-assets", () => ({
  makeMediaPrivateForGallery,
  releaseMediaFromPrivateGalleries,
  formatGalleryConversionError: () => "conversion failed",
}));

import { PATCH } from "@/app/api/private-galleries/[id]/route";
import { POST } from "@/app/api/private-galleries/route";
import { isGalleryLinkKey, makeGalleryLinkKey } from "@/lib/private-galleries";

const body = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    title: "Vogue",
    mediaIds: ["6a954266cd1abf83f4f47f29"],
    isActive: true,
    expiresAtLocal: "2099-01-01T10:00",
    timezoneOffsetMinutes: -240,
    ...overrides,
  });

const patch = (overrides: Record<string, unknown>) =>
  PATCH(new Request(`https://hm.test/api/private-galleries/${OID}`, { method: "PATCH", body: body(overrides) }), {
    params: Promise.resolve({ id: OID }),
  });

const post = (overrides: Record<string, unknown>) =>
  POST(new Request("https://hm.test/api/private-galleries", { method: "POST", body: body(overrides) }));

const savedSet = () => updateOne.mock.calls[0]?.[1].$set ?? {};

beforeEach(() => {
  for (const key of Object.keys(storedDoc)) delete storedDoc[key];
  Object.assign(storedDoc, {
    _id: new ObjectId(OID),
    slug: "vogue",
    passwordHash: "scrypt:a:b",
    accessToken: "old-token",
    mediaIds: ["6a954266cd1abf83f4f47f29"],
    expiresAtUtc: new Date("2099-01-01T06:00:00Z"),
  });
});

afterEach(() => vi.clearAllMocks());

const MEMBER = "6a954266cd1abf83f4f47f29";

describe("gallery create", () => {
  test("a public gallery needs no password, gets a key and leaves its photos as they are", async () => {
    const res = await post({ visibility: "public" });
    expect(res.status).toBe(200);
    const doc = insertOne.mock.calls[0]?.[0] ?? {};
    expect(doc).toMatchObject({ visibility: "public", passwordHash: null });
    expect(isGalleryLinkKey(doc.linkKey)).toBe(true);
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();
    expect(resolveGalleryPageUsage).not.toHaveBeenCalled();
  });

  test("a private gallery asks about page use, then hides its photos", async () => {
    const res = await post({ visibility: "private", password: "long-enough" });
    expect(res.status).toBe(200);
    expect(resolveGalleryPageUsage).toHaveBeenCalled();
    expect(makeMediaPrivateForGallery).toHaveBeenCalledWith(expect.anything(), [MEMBER]);
  });

  test("a private gallery still needs a password, refused before any photo is touched", async () => {
    const res = await post({ visibility: "private", password: "short" });
    expect(res.status).toBe(400);
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();
    expect(insertOne).not.toHaveBeenCalled();
  });
});

describe("gallery save — switching between private and public", () => {
  test("private → public: makes a key, drops the password, rotates the cookie token, hides nothing", async () => {
    expect((await patch({ visibility: "public" })).status).toBe(200);
    expect(savedSet()).toMatchObject({ visibility: "public", passwordHash: null });
    expect(isGalleryLinkKey(savedSet().linkKey)).toBe(true);
    expect(savedSet().accessToken).not.toBe("old-token");
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();
    // Every photo leaves the private gallery; its own visibility decides its file from now on.
    expect(releaseMediaFromPrivateGalleries).toHaveBeenCalledWith(expect.anything(), [MEMBER]);
  });

  test("public → private hides every photo, and needs a password first", async () => {
    Object.assign(storedDoc, { visibility: "public", linkKey: makeGalleryLinkKey(), passwordHash: null });

    expect((await patch({ visibility: "private" })).status).toBe(400);
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();

    expect((await patch({ visibility: "private", password: "long-enough" })).status).toBe(200);
    expect(makeMediaPrivateForGallery).toHaveBeenCalledWith(expect.anything(), [MEMBER]);
    expect(savedSet()).toMatchObject({ visibility: "private", linkKey: null });
  });

  test("a public gallery saved again keeps its link and hides nothing; Make a new link replaces it", async () => {
    const key = makeGalleryLinkKey();
    Object.assign(storedDoc, { visibility: "public", linkKey: key, passwordHash: null });

    await patch({ visibility: "public" });
    expect(savedSet()).not.toHaveProperty("linkKey");
    expect(makeMediaPrivateForGallery).not.toHaveBeenCalled();

    updateOne.mockClear();
    await patch({ visibility: "public", newLink: true });
    expect(isGalleryLinkKey(savedSet().linkKey)).toBe(true);
    expect(savedSet().linkKey).not.toBe(key);
  });

  test("an unknown visibility is refused", async () => {
    expect((await patch({ visibility: "link" })).status).toBe(400);
    expect(updateOne).not.toHaveBeenCalled();
  });
});
