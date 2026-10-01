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

  test("a deleted item leaves the list at once", () => {
    expect(withoutMedia(media, ["a"]).items.map((i) => i.id)).toEqual(["b"]);
  });
});

describe("blog posts saved on this device", () => {
  const blog: BlogSlice = {
    posts: [
      { id: "p1", title: "One", slug: "one", category: "", categoryLabel: "", isPublished: true, publishedAt: "2026-09-01T00:00:00.000Z", updatedAt: null },
    ],
    forms: {},
    categoryOptions: [{ id: "c1", name: "Stories", slug: "stories" }],
  };
  const values = {
    title: "Two",
    slug: "two",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    coverImagePublicId: "",
    categoryId: "c1",
    tags: [],
    author: "Hussain Marzooq",
    isPublished: false,
  };

  test("a new post goes to the top with its category name", () => {
    const next = withSavedPost(blog, "p2", values);
    expect(next.posts[0]).toMatchObject({ id: "p2", title: "Two", category: "stories", categoryLabel: "Stories", isPublished: false });
    expect(next.forms.p2).toEqual(values);
  });

  test("publishing keeps the first publish date", () => {
    const next = withSavedPost(blog, "p1", { ...values, title: "One", isPublished: true });
    expect(next.posts).toHaveLength(1);
    expect(next.posts[0].publishedAt).toBe("2026-09-01T00:00:00.000Z");
  });

  test("a deleted post leaves the list and the editor data", () => {
    const next = withoutPost(withSavedPost(blog, "p2", values), "p2");
    expect(next.posts.map((p) => p.id)).toEqual(["p1"]);
    expect(next.forms.p2).toBeUndefined();
  });
});
