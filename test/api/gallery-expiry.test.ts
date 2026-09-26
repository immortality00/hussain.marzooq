import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OID = "507f1f77bcf86cd799439011";
const DAY = 86_400_000;

const { updateOne, storedDoc, getDb } = vi.hoisted(() => {
  type GalleryUpdate = { $set: Record<string, unknown> };
  const updateOne = vi.fn<(filter: unknown, update: GalleryUpdate) => Promise<{ matchedCount: number }>>(
    async () => ({ matchedCount: 1 })
  );
  const storedDoc: Record<string, unknown> = {};
  const getDb = vi.fn(async () => ({ collection: () => ({ updateOne }) }));
  return { updateOne, storedDoc, getDb };
});

vi.mock("@/lib/server/db", () => ({ getDb }));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/app/api/_lib/admin-route", () => ({
  requireAdminObjectId: async () => ({ id: OID, oid: new ObjectId(OID) }),
  findByIdOr404: async () => ({ doc: storedDoc }),
}));
vi.mock("@/lib/server/private-gallery-admin", () => ({
  ensureUniquePrivateGallerySlug: async () => "test",
  serializePrivateGalleryAdminItem: (doc: Record<string, unknown>) => doc,
  validatePrivateGalleryMediaIds: async (_db: unknown, ids: string[]) => ({
    ok: true as const,
    mediaIds: ids,
  }),
}));
vi.mock("@/app/api/private-galleries/_lib/gallery-page-usage", () => ({
  resolveGalleryPageUsage: async () => null,
}));
vi.mock("@/lib/server/private-gallery-assets", () => ({
  makeMediaPrivateForGallery: async () => ({ failures: [] }),
  releaseMediaFromPrivateGalleries: async () => undefined,
  formatGalleryConversionError: () => "conversion failed",
}));

import { PATCH } from "@/app/api/private-galleries/[id]/route";

function localString(at: number, offsetMinutes: number) {
  return new Date(at - offsetMinutes * 60_000).toISOString().slice(0, 16);
}

async function patch(expiresAtLocal: string, offsetMinutes = -240) {
  const res = await PATCH(
    new Request(`https://hm.test/api/private-galleries/${OID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "test",
        mediaIds: ["6a954266cd1abf83f4f47f29"],
        isActive: true,
        expiresAtLocal,
        timezoneOffsetMinutes: offsetMinutes,
      }),
    }),
    { params: Promise.resolve({ id: OID }) }
  );

  return { status: res.status, body: (await res.json()) as { ok: boolean; error?: string } };
}

const PAST = new Date(Date.now() - 7 * DAY);

beforeEach(() => {
  Object.assign(storedDoc, {
    _id: new ObjectId(OID),
    slug: "test",
    mediaIds: ["6a954266cd1abf83f4f47f29"],
    expiresAtUtc: PAST,
    expiresAt: PAST,
    expiresAtLocal: localString(PAST.getTime(), -240),
  });
});

afterEach(() => vi.clearAllMocks());

describe("PATCH /api/private-galleries/[id] — expiry", () => {
  it("saves an expired gallery when the expiry is resubmitted unchanged", async () => {
    const { status, body } = await patch(localString(PAST.getTime(), -240));

    expect(status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("keeps the gallery expired — the save does not restore access", async () => {
    await patch(localString(PAST.getTime(), -240));

    const written = updateOne.mock.calls[0]![1].$set as { expiresAtUtc: Date };
    expect(Math.floor(written.expiresAtUtc.getTime() / 60_000)).toBe(
      Math.floor(PAST.getTime() / 60_000)
    );
    expect(written.expiresAtUtc.getTime()).toBeLessThan(Date.now());
  });

  it("still rejects a different past expiry", async () => {
    const { status, body } = await patch(localString(Date.now() - DAY, -240));

    expect(status).toBe(400);
    expect(body.error).toBe("Expiry date must be in the future.");
    expect(updateOne).not.toHaveBeenCalled();
  });

  it("accepts a new future expiry", async () => {
    const { status } = await patch(localString(Date.now() + 30 * DAY, -240));

    expect(status).toBe(200);
  });

  it("matches the stored instant regardless of the submitting timezone", async () => {
    const { status } = await patch(localString(PAST.getTime(), 330), 330);

    expect(status).toBe(200);
  });

  it("rejects a past expiry when the stored gallery has none recorded", async () => {
    delete storedDoc.expiresAtUtc;
    delete storedDoc.expiresAt;

    const { status, body } = await patch(localString(Date.now() - DAY, -240));

    expect(status).toBe(400);
    expect(body.error).toBe("Expiry date must be in the future.");
  });
});
