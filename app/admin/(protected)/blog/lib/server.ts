import type { Document } from "mongodb";
import { asIsoDate, asString } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import type { BlogCategoryOption, BlogListItem, BlogPostFormValues } from "./types";

export function categoryLabels(cats: Document[]) {
  const labels = new Map<string, string>();
  for (const c of cats) {
    const slug = asString(c.slug);
    if (slug) labels.set(slug, asString(c.name) || slug);
  }
  return labels;
}

export function blogListItemOf(d: Document, labels: Map<string, string>): BlogListItem {
  const category = asString(d.category);
  return {
    id: String(d._id),
    title: asString(d.title),
    slug: asString(d.slug),
    category,
    categoryLabel: category ? labels.get(category) ?? category : "",
    isPublished: d.isPublished === true,
    publishedAt: asIsoDate(d.publishedAt),
    updatedAt: asIsoDate(d.updatedAt),
  };
}

export function postFormOf(d: Document): BlogPostFormValues {
  return {
    title: asString(d.title),
    slug: asString(d.slug),
    excerpt: asString(d.excerpt),
    content: asString(d.content),
    coverImageUrl: asString(d.coverImageUrl),
    coverImagePublicId: asString(d.coverImagePublicId),
    categoryId: asString(d.categoryId),
    tags: Array.isArray(d.tags) ? d.tags.filter((t): t is string => typeof t === "string") : [],
    author: asString(d.author) || "Hussain Marzooq",
    isPublished: d.isPublished === true,
  };
}

export async function savedBlogPost(doc: Document) {
  const db = await getDb();
  const cats = await db.collection("blog_categories").find({}, { projection: { slug: 1, name: 1 } }).toArray();
  return { item: blogListItemOf(doc, categoryLabels(cats)), form: postFormOf(doc) };
}

export async function loadAdminBlog() {
  const db = await getDb();
  const [docs, cats] = await Promise.all([
    db.collection("blog_posts").find({}).sort({ updatedAt: -1, _id: -1 }).toArray(),
    db.collection("blog_categories").find({}).sort({ order: 1, createdAt: -1, _id: -1 }).toArray(),
  ]);
  const labels = categoryLabels(cats);
  const categoryOptions: BlogCategoryOption[] = cats.map((c) => ({
    id: String(c._id),
    name: asString(c.name),
    slug: asString(c.slug),
  }));

  return {
    posts: docs.map((d) => blogListItemOf(d, labels)),
    forms: Object.fromEntries(docs.map((d) => [String(d._id), postFormOf(d)])),
    categoryOptions,
  };
}
