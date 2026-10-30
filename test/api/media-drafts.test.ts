import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { deleteVideoPoster, deleteManagedCloudinaryAsset } = vi.hoisted(() => ({
  deleteVideoPoster: vi.fn(),
  deleteManagedCloudinaryAsset: vi.fn(async () => true),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("@/app/api/_lib/revalidate", () => ({
  revalidateMediaSurfaces: vi.fn(),
  revalidateSitePages: vi.fn(),
  revalidatePublicTree: vi.fn(),
}));
vi.mock("@/lib/server/video-posters", () => ({
  storeVideoPoster: vi.fn(async () => null),
  deleteVideoPoster,
  discardUnsavedPoster: vi.fn(),
}));
vi.mock("@/lib/server/media-asset-management", async () => ({
  ...(await vi.importActual<object>("@/lib/server/media-asset-management")),
  deleteStoredMediaAsset: vi.fn(),
}));
vi.mock("@/lib/server/cloudinary-assets", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-assets")),
  deleteManagedCloudinaryAsset,
}));
vi.mock("@/lib/server/cloudinary-private", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-private")),
  convertAssetDeliveryType: vi.fn(async (params: { publicId: string; to: string }) => ({
    ok: true as const,
    secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/${params.publicId}.jpg`,
  })),
}));
vi.mock("@/app/admin/(protected)/blog/lib/server", async () => ({
  ...(await vi.importActual<object>("@/app/admin/(protected)/blog/lib/server")),
  savedBlogPost: async () => ({ item: {}, form: {} }),
}));

import { POST as create } from "@/app/api/media/create/route";
import { DELETE as remove, PATCH as patchMedia } from "@/app/api/media/[id]/route";
import { PATCH as patchPost } from "@/app/api/blog/[id]/route";
import { POST as batchDraft } from "@/app/api/blog/drafts/route";
import { POST as usages } from "@/app/api/media/usages/route";
import { createMediaDraft } from "@/lib/server/media-drafts";
import { syncMediaDelivery } from "@/lib/server/media-delivery";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1";
const fileOf = (name: string) => ({
  secureUrl: `${CLOUD}/hm_visuals/media/photography/${name}.jpg`,
  publicId: `hm_visuals/media/photography/${name}`,
  resourceType: "image",
});
const photo = { title: "Gold Hour", type: "image", categories: ["photography"], tags: [], peopleIds: [], appearances: [] };

const posts = () => memory.collections.blog_posts ?? [];

async function createItem(body: Record<string, unknown>) {
  const res = await create(new Request("http://localhost/api/media/create", { method: "POST", body: JSON.stringify(body) }));
  return { res, body: (await res.json()) as Record<string, unknown> };
}

function seedMedia(title: string, over: Record<string, unknown> = {}) {
  const doc = { _id: new ObjectId(), ...photo, ...fileOf(title.toLowerCase()), title, isPublic: true, ...over };
  memory.collections.media!.push(doc);
  return doc;
}

const idParams = (id: unknown) => ({ params: Promise.resolve({ id: String(id) }) });

beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  deleteVideoPoster.mockClear();
  deleteManagedCloudinaryAsset.mockClear();
  resetMemoryDb({
    media: [],
    blog_posts: [],
    people_profiles: [],
    media_tags: [],
    private_galleries: [],
    page_sections: [],
    page_seo: [],
  });
});

describe("a new media item makes a waiting blog draft", () => {
  test("a public photo: one draft, cover = the photo, waiting, linked to the item", async () => {
    const { res, body } = await createItem({ ...photo, ...fileOf("gold"), description: "The light held." });
    expect(res.status).toBe(200);
    expect(body.created).toBe(true);

    expect(posts()).toHaveLength(1);
    const post = posts()[0]!;
    expect(post).toMatchObject({
      title: "Gold Hour",
      slug: "gold-hour",
      excerpt: "The light held.",
      coverImageUrl: fileOf("gold").secureUrl,
      coverImagePublicId: "",
      isPublished: false,
      publishedAt: null,
      awaitingReview: true,
      sourceMediaIds: [body.id],
    });
  });

  test("a hidden item makes none", async () => {
    await createItem({ ...photo, ...fileOf("gold"), isPublic: false });
    expect(posts()).toHaveLength(0);
  });

  test("an item hidden for a gated person makes none", async () => {
    const person = { _id: new ObjectId(), name: "Lina", slug: "lina", isPublic: true, isPrivate: true };
    memory.collections.people_profiles!.push(person);
    await createItem({ ...photo, ...fileOf("gold"), peopleIds: [String(person._id)] });
    expect(posts()).toHaveLength(0);
  });

  test("saving the same file again is not a new item: no second draft", async () => {
    await createItem({ ...photo, ...fileOf("gold") });
    const { body } = await createItem({ ...photo, ...fileOf("gold"), title: "Gold Hour again" });
    expect(body.created).toBe(false);
    expect(posts()).toHaveLength(1);
  });

  test("a dismissed draft does not come back when the same file is saved again", async () => {
    await createItem({ ...photo, ...fileOf("gold") });
    memory.collections.blog_posts = [];
    await createItem({ ...photo, ...fileOf("gold") });
    expect(posts()).toHaveLength(0);
  });

  test("blogDraft: false (batch upload) makes none", async () => {
    await createItem({ ...photo, ...fileOf("gold"), blogDraft: false });
    expect(posts()).toHaveLength(0);
  });

  test("a failed draft never fails the save", async () => {
    memory.failWritesTo.add("blog_posts");
    const { res, body } = await createItem({ ...photo, ...fileOf("gold") });
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.draftError).toBe("blog_posts write failed");
    expect(memory.collections.media).toHaveLength(1);
  });

  test("a second draft with the same title gets its own address", async () => {
    await createItem({ ...photo, ...fileOf("one") });
    await createItem({ ...photo, ...fileOf("two") });
    expect(posts().map((post) => post.slug)).toEqual(["gold-hour", "gold-hour-2"]);
  });

  test("names only public profiles, links only active tags", async () => {
    const open = { _id: new ObjectId(), name: "Lina", slug: "lina", isPublic: true, isPrivate: false };
    const hidden = { _id: new ObjectId(), name: "Omar", slug: "omar", isPublic: false };
    memory.collections.people_profiles!.push(open, hidden);
    memory.collections.media_tags!.push(
      { slug: "fashion", label: "Fashion", isActive: true },
      { slug: "old", label: "Old", isActive: false }
    );
    const item = seedMedia("Gold", { peopleIds: [String(open._id), String(hidden._id)], tags: ["fashion", "old"] });

    const { memoryDb } = await import("@/test/support/memory-db");
    await createMediaDraft(memoryDb as never, [String(item._id)]);

    const post = posts()[0]!;
    expect(post.content).toContain("[Lina](/people/lina)");
    expect(post.content).not.toContain("Omar");
    expect(post.content).toContain("[More Fashion](/photography/fashion)");
    expect(post.tags).toEqual(["Fashion"]);
  });

  test("a private gallery member makes none", async () => {
    const item = seedMedia("Gold");
    memory.collections.private_galleries!.push({ _id: new ObjectId(), mediaIds: [String(item._id)] });
    const { memoryDb } = await import("@/test/support/memory-db");
    expect(await createMediaDraft(memoryDb as never, [String(item._id)])).toBeNull();
  });
});

describe("batch upload: one draft for the batch", () => {
  const send = (body: unknown) =>
    batchDraft(new Request("http://localhost/api/blog/drafts", { method: "POST", body: JSON.stringify(body) }));

  test("one draft holding every new item; a retry adds to it while it is untouched", async () => {
    const a = seedMedia("One", { event: "Fashion Week" });
    const b = seedMedia("Two", { event: "Fashion Week" });
    expect((await send({ mediaIds: [String(a._id), String(b._id)], batchKey: "batch-0001" })).status).toBe(200);
    expect(posts()).toHaveLength(1);
    expect(posts()[0]).toMatchObject({ title: "Fashion Week", draftBatch: "batch-0001" });

    const c = seedMedia("Three", { event: "Fashion Week" });
    await send({ mediaIds: [String(c._id)], batchKey: "batch-0001" });
    expect(posts()).toHaveLength(1);
    expect(posts()[0]!.sourceMediaIds).toEqual([String(a._id), String(b._id), String(c._id)]);
    expect(posts()[0]!.excerpt).toBe("3 frames from Fashion Week.");
  });

  test("a retry appends to a draft already edited, keeping the edits", async () => {
    const a = seedMedia("One");
    await send({ mediaIds: [String(a._id)], batchKey: "batch-0002" });
    Object.assign(posts()[0]!, { content: "My own words.", updatedAt: new Date(Date.now() + 1000) });

    const b = seedMedia("Two");
    await send({ mediaIds: [String(b._id)], batchKey: "batch-0002" });
    expect(posts()[0]!.content).toBe(`My own words.\n\n![Two](${fileOf("two").secureUrl})\n\n*Two*`);
  });

  test("refuses anything but a list of item ids", async () => {
    for (const body of [{}, { mediaIds: [] }, { mediaIds: ["nope"] }, { mediaIds: [{ $ne: 1 }] }, { mediaIds: "x" }]) {
      expect((await send(body)).status).toBe(400);
    }
    const tooMany = Array.from({ length: 301 }, () => new ObjectId().toHexString());
    expect((await send({ mediaIds: tooMany })).status).toBe(400);
    const big = await batchDraft(new Request("http://localhost/api/blog/drafts", { method: "POST", body: "x".repeat(20_000) }));
    expect(big.status).toBe(400);
  });

  test("a bad batch key is ignored, not trusted", async () => {
    const a = seedMedia("One");
    await send({ mediaIds: [String(a._id)], batchKey: "$where" });
    expect(posts()[0]!.draftBatch).toBeUndefined();
  });
});

describe("a waiting draft follows its item", () => {
  async function drafted(...titles: string[]) {
    const docs = titles.map((title) => seedMedia(title));
    const { memoryDb } = await import("@/test/support/memory-db");
    await createMediaDraft(memoryDb as never, docs.map((doc) => String(doc._id)));
    return docs;
  }

  test("deleting the item deletes its waiting draft, without asking", async () => {
    const [item] = await drafted("Gold");
    const res = await remove(new Request("http://localhost/api/media/x", { method: "DELETE" }), idParams(item!._id));
    expect(res.status).toBe(200);
    expect(posts()).toHaveLength(0);
  });

  test("the bulk-delete check doesn't list a waiting draft", async () => {
    const [item] = await drafted("Gold");
    const res = await usages(
      new Request("http://localhost/api/media/usages", { method: "POST", body: JSON.stringify({ ids: [String(item!._id)] }) })
    );
    expect(((await res.json()) as { items: unknown[] }).items).toEqual([]);
  });

  test("a published post is a normal place: deleting asks first", async () => {
    const [item] = await drafted("Gold");
    Object.assign(posts()[0]!, { isPublished: true, awaitingReview: false });
    const res = await remove(new Request("http://localhost/api/media/x", { method: "DELETE" }), idParams(item!._id));
    expect(res.status).toBe(409);
    expect(posts()).toHaveLength(1);
  });

  test("a batch draft drops the deleted item and is built again from the rest", async () => {
    const [one, two] = await drafted("One", "Two");
    await remove(new Request("http://localhost/api/media/x", { method: "DELETE" }), idParams(one!._id));
    expect(posts()).toHaveLength(1);
    expect(posts()[0]).toMatchObject({ title: "Two", sourceMediaIds: [String(two!._id)], coverImageUrl: fileOf("two").secureUrl });
  });

  test("an edited batch draft keeps the edits and loses only the item's picture", async () => {
    const [one] = await drafted("One", "Two");
    Object.assign(posts()[0]!, {
      content: `Words.\n\n![One](${fileOf("one").secureUrl})\n\n![Two](${fileOf("two").secureUrl})`,
      updatedAt: new Date(Date.now() + 1000),
    });
    await remove(new Request("http://localhost/api/media/x", { method: "DELETE" }), idParams(one!._id));
    expect(posts()[0]!.content).toBe(`Words.\n\n![Two](${fileOf("two").secureUrl})`);
    expect(posts()[0]!.coverImageUrl).toBe("");
  });

  test("hiding the item removes its waiting draft without asking", async () => {
    const [item] = await drafted("Gold");
    const res = await patchMedia(
      new Request("http://localhost/api/media/x", { method: "PATCH", body: JSON.stringify({ ...photo, ...fileOf("gold"), isPublic: false }) }),
      idParams(item!._id)
    );
    expect(res.status).toBe(200);
    expect(posts()).toHaveLength(0);
  });

  test("an item made private anywhere (a person gated, a gallery) loses its waiting draft", async () => {
    const [item] = await drafted("Gold");
    item!.isPublic = false;
    const { memoryDb } = await import("@/test/support/memory-db");
    await syncMediaDelivery(memoryDb as never, [String(item!._id)]);
    expect(posts()).toHaveLength(0);
  });

  test("a video link's thumbnail stays while a post uses it", async () => {
    const poster = "hm_visuals/media/posters/abc";
    const item = seedMedia("Film", {
      type: "embed",
      secureUrl: null,
      publicId: null,
      posterPublicId: poster,
      posterUrl: `${CLOUD}/${poster}.jpg`,
    });
    memory.collections.blog_posts!.push({ _id: new ObjectId(), title: "Film", coverImageUrl: `${CLOUD}/${poster}.jpg`, content: "" });
    await remove(new Request("http://localhost/api/media/x", { method: "DELETE" }), idParams(item._id));
    expect(deleteVideoPoster).not.toHaveBeenCalled();
  });
});

describe("publishing a draft", () => {
  async function publish(post: Record<string, unknown>) {
    return patchPost(
      new Request("http://localhost/api/blog/x", { method: "PATCH", body: JSON.stringify({ isPublished: true }) }),
      idParams(post._id)
    );
  }

  test("is the action it waited for", async () => {
    const item = seedMedia("Gold");
    const { memoryDb } = await import("@/test/support/memory-db");
    await createMediaDraft(memoryDb as never, [String(item._id)]);
    expect((await publish(posts()[0]!)).status).toBe(200);
    expect(posts()[0]).toMatchObject({ isPublished: true, awaitingReview: false });
  });

  test("a draft of a scheduled item goes out with the item", async () => {
    const goesLive = new Date(Date.now() + 86_400_000);
    const item = seedMedia("Gold", { publishAt: goesLive });
    const { memoryDb } = await import("@/test/support/memory-db");
    await createMediaDraft(memoryDb as never, [String(item._id)]);
    await publish(posts()[0]!);
    expect((posts()[0]!.publishedAt as Date).getTime()).toBe(goesLive.getTime());
  });
});
