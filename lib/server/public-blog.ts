import type { Document, WithId } from "mongodb";
import { getDb } from "@/lib/server/db";
import { readingMinutes } from "@/lib/reading-time";

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  author: string;
  publishedAt: string | null;
  readingMinutes: number;
};

export type BlogPostDetail = BlogPostCard & {
  content: string;
  ogImageUrl: string;
};

export type PublicBlogCategory = {
  slug: string;
  label: string;
  count: number;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function toIso(v: unknown): string | null {
  return v instanceof Date ? v.toISOString() : null;
}

function toCard(doc: WithId<Document>, categoryLabels: Map<string, string>): BlogPostCard {
  const category = asString(doc.category);
  return {
    id: String(doc._id),
    title: asString(doc.title),
    slug: asString(doc.slug),
    excerpt: asString(doc.excerpt),
    coverImageUrl: asString(doc.coverImageUrl),
    category,
    categoryLabel: category ? categoryLabels.get(category) ?? category : "",
    tags: asStringArray(doc.tags),
    author: asString(doc.author) || "Hussain Marzooq",
    publishedAt: toIso(doc.publishedAt),
    readingMinutes: readingMinutes(asString(doc.content)),
  };
}

async function categoryLabelMap(): Promise<Map<string, string>> {
  const db = await getDb();
  const cats = await db
    .collection("blog_categories")
    .find({}, { projection: { slug: 1, name: 1 } })
    .toArray();
  const map = new Map<string, string>();
  for (const c of cats) {
    const slug = asString(c.slug);
    if (slug) map.set(slug, asString(c.name) || slug);
  }
  return map;
}

export async function getPublishedPosts(categorySlug?: string): Promise<BlogPostCard[]> {
  try {
    const db = await getDb();
    const filter: Record<string, unknown> = {
      isPublished: true,
      publishedAt: { $lte: new Date() },
    };
    if (categorySlug) filter.category = categorySlug;

    const [docs, labels] = await Promise.all([
      db
        .collection("blog_posts")
        .find(filter)
        .sort({ publishedAt: -1 })
        .toArray(),
      categoryLabelMap(),
    ]);

    return docs.map((d) => toCard(d, labels));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const db = await getDb();
    const doc = await db.collection("blog_posts").findOne({
      slug,
      isPublished: true,
      publishedAt: { $lte: new Date() },
    });
    if (!doc) return null;

    const labels = await categoryLabelMap();
    const card = toCard(doc, labels);
    return {
      ...card,
      content: asString(doc.content),
      ogImageUrl: asString(doc.coverImageUrl),
    };
  } catch {
    return null;
  }
}

export async function getPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  try {
    const db = await getDb();
    const [cats, counts] = await Promise.all([
      db
        .collection("blog_categories")
        .find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .toArray(),
      db
        .collection("blog_posts")
        .aggregate<{ _id: string; count: number }>([
          { $match: { isPublished: true, publishedAt: { $lte: new Date() }, category: { $type: "string", $ne: "" } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    const countMap = new Map<string, number>();
    for (const row of counts) countMap.set(row._id, row.count);

    return cats
      .map((c) => {
        const slug = asString(c.slug);
        return { slug, label: asString(c.name) || slug, count: countMap.get(slug) ?? 0 };
      })
      .filter((c) => c.slug && c.count > 0);
  } catch {
    return [];
  }
}
