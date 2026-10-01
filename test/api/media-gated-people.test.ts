import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";
import { pickPeople } from "@/app/api/_lib/media";

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
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

import { POST as create } from "@/app/api/media/create/route";
import { PATCH as patch } from "@/app/api/media/[id]/route";

const hidden = new ObjectId();
const passwordOnly = new ObjectId();
const open = new ObjectId();

const embed = (videoId: string, peopleIds: string[]) => ({
  title: "Film",
  categories: ["videography"],
  tags: [],
  appearances: [],
  peopleIds,
  isPublic: true,
  type: "embed",
  embedUrl: `https://www.youtube.com/watch?v=${videoId}`,
});

const request = (body: unknown, method = "POST") =>
  new Request("http://localhost/api/media", { method, body: JSON.stringify(body) });

beforeEach(() => {
  resetMemoryDb({
    people_profiles: [
      { _id: hidden, name: "Hidden Person", isPublic: false },
      { _id: passwordOnly, name: "Gated Person", isPublic: true, isPrivate: true },
      { _id: open, name: "Open Person", isPublic: true, isPrivate: false },
    ],
    media: [],
  });
});

describe("pickPeople", () => {
  const docs = new Map([
    [String(hidden), { name: "Hidden Person", isPublic: false }],
    [String(passwordOnly), { name: "Gated Person", isPublic: true, isPrivate: true }],
    [String(open), { name: "Open Person", isPublic: true, isPrivate: false }],
    ["nameless", { name: "  ", isPublic: true }],
  ]);

  test("a hidden or password-protected person makes the item gated", () => {
    expect(pickPeople([String(open), String(hidden)], docs).gatedPersonName).toBe("Hidden Person");
    expect(pickPeople([String(passwordOnly)], docs).gatedPersonName).toBe("Gated Person");
  });

  test("open people leave it public, and unknown or nameless ids are dropped", () => {
    const picked = pickPeople([String(open), "nameless", String(new ObjectId())], docs);
    expect(picked).toEqual({ peopleIds: [String(open)], people: ["Open Person"], gatedPersonName: null });
  });
});

describe("media linked to a gated person", () => {
  test("is saved hidden when created, even when sent as public", async () => {
    const res = await create(request(embed("Or18TXg2bnY", [String(hidden)])));
    expect(res.status).toBe(200);
    expect(memory.collections.media?.[0]?.isPublic).toBe(false);
  });

  test("is saved hidden when an edit links a password-protected person", async () => {
    const res = await create(request(embed("QLEzDzb-cJU", [String(open)])));
    expect(res.status).toBe(200);
    const doc = memory.collections.media![0]!;
    expect(doc.isPublic).toBe(true);

    const ctx = { params: Promise.resolve({ id: String(doc._id) }) };
    const updated = await patch(request(embed("QLEzDzb-cJU", [String(passwordOnly)]), "PATCH"), ctx);
    expect(updated.status).toBe(200);
    expect(memory.collections.media![0]!.isPublic).toBe(false);
  });
});
