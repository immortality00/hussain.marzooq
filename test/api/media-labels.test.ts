import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { convertAssetDeliveryType, revalidateMediaSurfaces, dbDown } = vi.hoisted(() => ({
  dbDown: { on: false },
  convertAssetDeliveryType: vi.fn(async (params: { publicId: string; to: string }) => ({
    ok: true as const,
    secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/${params.publicId}.jpg`,
  })),
  revalidateMediaSurfaces: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return {
    getDb: async () => {
      if (dbDown.on) throw Object.assign(new Error("Server selection timed out after 10000 ms"), { name: "MongoServerSelectionError" });
      return memoryDb;
    },
  };
});
vi.mock("@/app/api/_lib/revalidate", () => ({ revalidateMediaSurfaces, revalidateSitePages: vi.fn() }));
vi.mock("@/lib/server/cloudinary-private", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-private")),
  convertAssetDeliveryType,
}));

import { PATCH } from "@/app/api/media/[id]/labels/route";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1";
const FILE_ID = "hm_visuals/media/photography/dune";
const FILE_URL = `${CLOUD}/${FILE_ID}.jpg`;
const UPDATED = new Date("2026-10-20T10:00:00.000Z");

const sara = { _id: new ObjectId(), name: "Sara", isPublic: true, isPrivate: false };
const ali = { _id: new ObjectId(), name: "Ali", isPublic: true, isPrivate: true };
const omar = { _id: new ObjectId(), name: "Omar", isPublic: false };

let media: Record<string, unknown> & { _id: ObjectId };

function seed({ heroUrl = "", item = {} as Record<string, unknown>, galleries = [] as Record<string, unknown>[] } = {}) {
  media = {
    _id: new ObjectId(),
    type: "image",
    title: "Dune",
    description: "Sand at dusk",
    categories: ["photography"],
    secureUrl: FILE_URL,
    publicId: FILE_ID,
    resourceType: "image",
    tags: ["fashion", "Old free text"],
    peopleIds: [String(sara._id)],
    people: ["Sara", "Legacy name"],
    isPublic: true,
    updatedAt: UPDATED,
    ...item,
  };
  resetMemoryDb({
    media: [media],
    media_tags: [
      { _id: new ObjectId(), slug: "fashion", label: "Fashion", isActive: true },
      { _id: new ObjectId(), slug: "studio", label: "Studio", isActive: true },
    ],
    people_profiles: [sara, ali, omar],
    page_sections: [{ slug: "home", data: { hero: { images: [{ url: heroUrl, publicId: "" }] } } }],
    page_seo: [],
    blog_posts: [],
    private_galleries: galleries,
  });
}

function send(body: unknown, { version, raw }: { version?: string; raw?: string } = {}) {
  return PATCH(
    new Request("http://localhost/api/media/x/labels", {
      method: "PATCH",
      headers: version === undefined ? {} : { "x-hm-expected-version": version },
      body: raw ?? JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: String(media._id) }) }
  );
}

const heroUrl = () => (memory.collections.page_sections![0]!.data as { hero: { images: { url: string }[] } }).hero.images[0]!.url;

beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  seed();
});

afterEach(() => {
  dbDown.on = false;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("PATCH /api/media/[id]/labels — tags", () => {
  test("replaces the tags and leaves everything else alone", async () => {
    const res = await send({ tags: ["fashion", "studio"] });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(media).toMatchObject({
      tags: ["fashion", "studio"],
      title: "Dune",
      description: "Sand at dusk",
      categories: ["photography"],
      peopleIds: [String(sara._id)],
      people: ["Sara", "Legacy name"],
      isPublic: true,
    });
    expect(media.updatedAt).not.toEqual(UPDATED);
    expect(body.listItem).toMatchObject({ id: String(media._id), tags: ["fashion", "studio"] });
    expect(body.listItem.updatedAt).toBe((media.updatedAt as Date).toISOString());
    expect(body.item.id).toBe(String(media._id));
    expect(revalidateMediaSurfaces).toHaveBeenCalledTimes(1);
  });

  test("a tag the item already had is kept even when it is not in Tags", async () => {
    const res = await send({ tags: ["Old free text", "studio"] });

    expect(res.status).toBe(200);
    expect(media.tags).toEqual(["Old free text", "studio"]);
  });

  test("removing every tag is allowed", async () => {
    expect((await send({ tags: [] })).status).toBe(200);
    expect(media.tags).toEqual([]);
  });

  test("a new tag that is not in Tags is refused and nothing is written", async () => {
    const res = await send({ tags: ["fashion", "ghost"] });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("“ghost” is not in Tags.");
    expect(media.tags).toEqual(["fashion", "Old free text"]);
    expect(media.updatedAt).toEqual(UPDATED);
  });

  test("a new tag that is not a slug is refused", async () => {
    const res = await send({ tags: ["Fashion Week"] });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("“Fashion Week” is not in Tags.");
  });

  test("duplicates and blanks are dropped", async () => {
    await send({ tags: ["studio", " studio ", "", "fashion"] });
    expect(media.tags).toEqual(["studio", "fashion"]);
  });
});

describe("PATCH /api/media/[id]/labels — people", () => {
  test("stores the ids with their names and leaves the tags alone", async () => {
    const res = await send({ peopleIds: [String(sara._id)] });

    expect(res.status).toBe(200);
    expect(media).toMatchObject({ peopleIds: [String(sara._id)], people: ["Sara"], tags: ["fashion", "Old free text"], isPublic: true });
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("an id with no profile is dropped, as in the full save", async () => {
    await send({ peopleIds: [String(new ObjectId()), String(sara._id)] });
    expect(media).toMatchObject({ peopleIds: [String(sara._id)], people: ["Sara"] });
  });

  test("a password-protected person hides the item and makes its file private", async () => {
    const res = await send({ peopleIds: [String(sara._id), String(ali._id)] });

    expect(res.status).toBe(200);
    expect(media).toMatchObject({ isPublic: false, deliveryType: "authenticated", people: ["Sara", "Ali"] });
    expect(convertAssetDeliveryType).toHaveBeenCalledWith(expect.objectContaining({ from: "upload", to: "authenticated" }));
    expect((await res.json()).listItem).toMatchObject({ isPublic: false });
  });

  test("a hidden person hides the item too", async () => {
    await send({ peopleIds: [String(omar._id)] });
    expect(media.isPublic).toBe(false);
  });

  test("removing the last gated person leaves the item hidden, as in the full save", async () => {
    seed({ item: { isPublic: false, deliveryType: "authenticated", peopleIds: [String(ali._id)], people: ["Ali"] } });

    const res = await send({ peopleIds: [] });

    expect(res.status).toBe(200);
    expect(media).toMatchObject({ isPublic: false, deliveryType: "authenticated", peopleIds: [], people: [] });
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("a gallery member stays hidden whoever is linked", async () => {
    seed({
      item: { isPublic: false, deliveryType: "authenticated" },
      galleries: [{ _id: new ObjectId(), title: "Client", slug: "client", mediaIds: [] }],
    });
    (memory.collections.private_galleries![0] as { mediaIds: string[] }).mediaIds.push(String(media._id));

    await send({ peopleIds: [String(sara._id)] });

    expect(media).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });

  test("a file that could not be made private is reported; the item is still hidden", async () => {
    convertAssetDeliveryType.mockResolvedValueOnce({ ok: false, error: "Rate limited" } as never);

    const res = await send({ peopleIds: [String(ali._id)] });

    expect(res.status).toBe(200);
    expect(media.isPublic).toBe(false);
    expect((await res.json()).deliveryError).toBe(
      "“Dune” is hidden, but its file could not be made private (Rate limited). Save again to retry."
    );
  });
});

describe("PATCH /api/media/[id]/labels — a page uses the photo", () => {
  test("linking a gated person asks first; nothing is written", async () => {
    seed({ heroUrl: FILE_URL });

    const res = await send({ peopleIds: [String(ali._id)] });

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      code: "MEDIA_IN_USE",
      items: [{ title: "Dune", usedOn: ["Home — hero photo 1"] }],
    });
    expect(media).toMatchObject({ isPublic: true, peopleIds: [String(sara._id)] });
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("clearPageUsages empties those places, then links and hides", async () => {
    seed({ heroUrl: FILE_URL });

    const res = await send({ peopleIds: [String(ali._id)], clearPageUsages: true });

    expect(res.status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(media).toMatchObject({ isPublic: false, deliveryType: "authenticated", people: ["Ali"] });
  });

  test("a page that could not be cleared stops the save", async () => {
    seed({ heroUrl: FILE_URL });
    memory.failWritesTo.add("page_sections");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await send({ peopleIds: [String(ali._id)], clearPageUsages: true });

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Could not update: Home — hero photo 1. Nothing was saved.");
    expect(media).toMatchObject({ isPublic: true, peopleIds: [String(sara._id)] });
  });

  test("a tag change on a public item never asks", async () => {
    seed({ heroUrl: FILE_URL });
    expect((await send({ tags: ["studio"] })).status).toBe(200);
  });
});

describe("PATCH /api/media/[id]/labels — changed on another device", () => {
  test("the version it was opened with is accepted", async () => {
    expect((await send({ tags: ["studio"] }, { version: UPDATED.toISOString() })).status).toBe(200);
  });

  test("an older version gets 409 with the current record; nothing is written", async () => {
    const res = await send({ tags: ["studio"] }, { version: "2026-10-01T00:00:00.000Z" });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.code).toBe("RECORD_CHANGED");
    expect(body.current.listItem).toMatchObject({ tags: ["fashion", "Old free text"], updatedAt: UPDATED.toISOString() });
    expect(media.tags).toEqual(["fashion", "Old free text"]);
  });

  test("an item never saved has an empty version", async () => {
    seed({ item: { updatedAt: undefined } });
    expect((await send({ tags: ["studio"] }, { version: "" })).status).toBe(200);
  });
});

describe("PATCH /api/media/[id]/labels — refused requests", () => {
  const refused = (raw: string) => send(null, { raw }).then(async (res) => ({ status: res.status, error: (await res.json()).error }));

  test.each([
    ["not JSON", "{tags:", "Invalid body"],
    ["an array", "[]", "Invalid body"],
    ["a string", '"tags"', "Invalid body"],
    ["no fields", "{}", "Nothing to change."],
    ["only clearPageUsages", '{"clearPageUsages":true}', "Nothing to change."],
    ["tags not a list", '{"tags":"fashion"}', "Tags must be a list."],
    ["tags with a number", '{"tags":[1]}', "Tags must be text."],
    ["tags with an object", '{"tags":[{"$ne":1}]}', "Tags must be text."],
    ["people not a list", '{"peopleIds":{"$in":[]}}', "People must be a list."],
    ["a people id that is not an id", '{"peopleIds":["sara"]}', "People must be people profile ids."],
    ["too many tags", JSON.stringify({ tags: Array.from({ length: 61 }, (_, i) => `t${i}`) }), "A media item can have at most 60 tags."],
    [
      "too many people",
      JSON.stringify({ peopleIds: Array.from({ length: 61 }, () => String(new ObjectId())) }),
      "A media item can have at most 60 people.",
    ],
  ])("%s → 400", async (_name, raw, error) => {
    expect(await refused(raw)).toEqual({ status: 400, error });
    expect(media.updatedAt).toEqual(UPDATED);
  });

  test("a tag longer than 200 characters → 400", async () => {
    const res = await send({ tags: ["a".repeat(201)] });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/^Tags: “a{40}…” is too long\.$/);
  });

  test("a body over 16 KB → 400", async () => {
    const res = await send({ tags: ["studio"], padding: "x".repeat(17 * 1024) });
    expect(res.status).toBe(400);
  });

  test("an unknown item → 404", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/media/x/labels", { method: "PATCH", body: JSON.stringify({ tags: [] }) }),
      { params: Promise.resolve({ id: String(new ObjectId()) }) }
    );
    expect(res.status).toBe(404);
  });

  test("the database not answering → 503 with the reason", async () => {
    dbDown.on = true;
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await send({ tags: ["studio"] });

    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("The site's database isn't responding. Try again shortly.");
  });

  test("a malformed id → 400", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/media/x/labels", { method: "PATCH", body: JSON.stringify({ tags: [] }) }),
      { params: Promise.resolve({ id: "not-an-id" }) }
    );
    expect(res.status).toBe(400);
  });
});
