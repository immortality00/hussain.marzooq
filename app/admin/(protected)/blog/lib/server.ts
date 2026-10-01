import { getDb } from "@/lib/server/db";
import type { BlogCategoryOption, BlogListItem, BlogPostFormValues } from "./types";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function loadBlogList(): Promise<BlogListItem[]> {
  const db = await getDb();
  const [docs, cats] = await Promise.all([
    db.collection("blog_posts").find({}).sort({ updatedAt: -1 }).toArray(),
    db.collection("blog_categories").find({}, { projection: { slug: 1, name: 1 } }).toArray(),
  ]);

  const labels = new Map<string, string>();
  for (const c of cats) {
    const slug = str(c.slug);
    if (slug) labels.set(slug, str(c.name) || slug);
  }

  return docs.map((d) => {
    const category = str(d.category);
    return {
      id: String(d._id),
      title: str(d.title),
      slug: str(d.slug),
      category,
      categoryLabel: category ? labels.get(category) ?? category : "",
      isPublished: d.isPublished === true,
      publishedAt: d.publishedAt instanceof Date ? d.publishedAt.toISOString() : null,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : null,
    };
  });
}

export async function loadCategoryOptions(): Promise<BlogCategoryOption[]> {
  const db = await getDb();
  const cats = await db
    .collection("blog_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();
  return cats.map((c) => ({ id: String(c._id), name: str(c.name), slug: str(c.slug) }));
}

export async function loadPostForms(): Promise<Record<string, BlogPostFormValues>> {
  const db = await getDb();
  const docs = await db.collection("blog_posts").find({}).toArray();
  return Object.fromEntries(docs.map((d) => [String(d._id), postFormOf(d)]));
}

function postFormOf(d: Record<string, unknown>): BlogPostFormValues {
  return {
    title: str(d.title),
    slug: str(d.slug),
    excerpt: str(d.excerpt),
    content: str(d.content),
    coverImageUrl: str(d.coverImageUrl),
    coverImagePublicId: str(d.coverImagePublicId),
    categoryId: str(d.categoryId),
    tags: Array.isArray(d.tags) ? d.tags.filter((t): t is string => typeof t === "string") : [],
    author: str(d.author) || "Hussain Marzooq",
    isPublished: d.isPublished === true,
  };
}
