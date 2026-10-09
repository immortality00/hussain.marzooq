import { ObjectId } from "mongodb";
import { revalidatePublicTree } from "@/app/api/_lib/revalidate";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asNullableString,
  asStringArray,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { slugifyTag, isValidTagSlug } from "@/lib/server/media-tags";
import { isAllowedCloudinaryUrl } from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_BLOG_FOLDER } from "@/lib/cloudinary-folders";

import { loadAdminBlog, savedBlogPost } from "@/app/admin/(protected)/blog/lib/server";

export const dynamic = "force-dynamic";

const DEFAULT_AUTHOR = "Hussain Marzooq";

function asDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  return noStoreJson({ ok: true, items: (await loadAdminBlog()).posts });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const title = (asNullableString(bodyUnknown.title) ?? "").trim();
  if (!title) return noStoreJson({ ok: false, error: "Title is required" }, { status: 400 });

  const slug = slugifyTag(asNullableString(bodyUnknown.slug)?.trim() || title);
  if (!slug || !isValidTagSlug(slug)) {
    return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const excerpt = (asNullableString(bodyUnknown.excerpt) ?? "").trim();
  const content = asNullableString(bodyUnknown.content) ?? "";
  const author = (asNullableString(bodyUnknown.author) ?? "").trim() || DEFAULT_AUTHOR;
  const tags = asStringArray(bodyUnknown.tags);
  const coverImageUrl = (asNullableString(bodyUnknown.coverImageUrl) ?? "").trim();
  const coverImagePublicId = (asNullableString(bodyUnknown.coverImagePublicId) ?? "").trim();
  const isPublished = bodyUnknown.isPublished === true;

  if (coverImageUrl && coverImagePublicId && !isAllowedCloudinaryUrl(coverImageUrl, [CLOUDINARY_BLOG_FOLDER])) {
    return noStoreJson(
      { ok: false, error: "Uploaded cover image must be in the blog folder." },
      { status: 400 }
    );
  }

  const db = await getDb();

  const existing = await db.collection("blog_posts").findOne({ slug }, { projection: { _id: 1 } });
  if (existing) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  let categoryId: string | null = null;
  let category = "";
  const requestedCategoryId = (asNullableString(bodyUnknown.categoryId) ?? "").trim();
  if (requestedCategoryId) {
    if (!ObjectId.isValid(requestedCategoryId)) {
      return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    }
    const cat = await db
      .collection("blog_categories")
      .findOne({ _id: new ObjectId(requestedCategoryId) }, { projection: { slug: 1 } });
    if (!cat) return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    categoryId = String(cat._id);
    category = typeof cat.slug === "string" ? cat.slug : "";
  }

  const now = new Date();
  const publishedAt = isPublished ? asDate(bodyUnknown.publishedAt) ?? now : null;

  const doc = {
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    coverImagePublicId,
    categoryId,
    category,
    tags,
    author,
    isPublished,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection("blog_posts").insertOne(doc);

  revalidatePublicTree("/blog");

  return noStoreJson({ ok: true, id: r.insertedId.toString(), ...(await savedBlogPost({ ...doc, _id: r.insertedId })) });
}
