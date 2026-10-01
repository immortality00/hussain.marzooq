import { describe, expect, test } from "vitest";
import { withSavedMedia, withoutMedia, type SavedMedia } from "@/app/admin/(protected)/media/lib/media-store";
import { withSavedPost, withoutPost, type BlogSlice } from "@/app/admin/(protected)/blog/lib/blog-store";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type Media = AdminSnapshot["media"];

function listItem(id: string, title: string) {
  return { id, title } as Media["items"][number];
}

function saved(id: string, title: string): SavedMedia {
  return { item: { id, title } as Media["full"][string], listItem: listItem(id, title) };
}

const media: Media = {
  items: [listItem("a", "A"), listItem("b", "B")],
  nextCursor: "cursor",
  full: { a: saved("a", "A").item, b: saved("b", "B").item },
};

describe("media saved on this device", () => {
  test("a new item goes to the top of the list and into the editor data", () => {
    const next = withSavedMedia(media, saved("c", "C"), true);
    expect(next.items.map((i) => i.id)).toEqual(["c", "a", "b"]);
    expect(next.full.c.title).toBe("C");
    expect(next.nextCursor).toBe("cursor");
  });

  test("an edited item is replaced where it is", () => {
    const next = withSavedMedia(media, saved("b", "B edited"), false);
    expect(next.items.map((i) => i.title)).toEqual(["A", "B edited"]);
    expect(next.full.b.title).toBe("B edited");
  });

  test("an edited item that is not on the first page is not added to it", () => {
    const next = withSavedMedia(media, saved("z", "Z"), false);
    expect(next.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(next.full.z.title).toBe("Z");
  });

  test("a deleted item leaves the list and the editor data at once", () => {
    const next = withoutMedia(media, ["a"]);
    expect(next.items.map((i) => i.id)).toEqual(["b"]);
    expect(next.full.a).toBeUndefined();
  });
});

describe("blog posts saved on this device", () => {
  const item = (id: string, title: string, publishedAt: string | null) => ({
    id,
    title,
    slug: title.toLowerCase(),
    category: "stories",
    categoryLabel: "Stories",
    isPublished: publishedAt !== null,
    publishedAt,
    updatedAt: "2026-10-01T10:00:00.000Z",
  });
  const form = (title: string) => ({
    title,
    slug: title.toLowerCase(),
    excerpt: "",
    content: "",
    coverImageUrl: "",
    coverImagePublicId: "",
    categoryId: "c1",
    tags: [],
    author: "Hussain Marzooq",
    isPublished: false,
  });
  const blog: BlogSlice = {
    posts: [item("p1", "One", "2026-09-01T00:00:00.000Z")],
    forms: { p1: form("One") },
    categoryOptions: [{ id: "c1", name: "Stories", slug: "stories" }],
  };

  test("a saved post goes to the top exactly as the server returned it", () => {
    const next = withSavedPost(blog, { item: item("p2", "Two", null), form: form("Two") });
    expect(next.posts.map((p) => p.id)).toEqual(["p2", "p1"]);
    expect(next.posts[0]).toMatchObject({ categoryLabel: "Stories", updatedAt: "2026-10-01T10:00:00.000Z" });
    expect(next.forms.p2?.title).toBe("Two");
  });

  test("saving an existing post replaces it instead of adding a copy", () => {
    const next = withSavedPost(blog, { item: item("p1", "One edited", "2026-09-01T00:00:00.000Z"), form: form("One edited") });
    expect(next.posts).toHaveLength(1);
    expect(next.posts[0]?.title).toBe("One edited");
  });

  test("a deleted post leaves the list and the editor data", () => {
    const next = withoutPost(blog, "p1");
    expect(next.posts).toEqual([]);
    expect(next.forms.p1).toBeUndefined();
  });
});
