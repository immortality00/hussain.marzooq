import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import {
  findByIdOr404,
  requireAdminObjectId,
} from "@/app/api/_lib/admin-route";
import {
  asString,
  asStringArray,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { slugifyTag, isValidTagSlug } from "@/lib/server/media-tags";
import {
  deleteManagedCloudinaryAsset,
  isAllowedCloudinaryUrl,
} from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_BLOG_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

function asDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const db = await getDb();
  const found = await findByIdOr404(db, "blog_posts", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return noStoreJson({ ok: false, error: "Title is required" }, { status: 400 });
    patch.title = title;
  }
  if (typeof body.excerpt === "string") patch.excerpt = body.excerpt.trim();
  if (typeof body.content === "string") patch.content = body.content;
  if (typeof body.author === "string") patch.author = body.author.trim() || "Hussain Marzooq";
  if ("tags" in body) patch.tags = asStringArray(body.tags);

  if (typeof body.slug === "string") {
    const slug = slugifyTag(body.slug);
    if (!slug || !isValidTagSlug(slug)) {
      return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
    const conflict = await db
      .collection("blog_posts")
      .findOne({ slug, _id: { $ne: oid } }, { projection: { _id: 1 } });
    if (conflict) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
    patch.slug = slug;
  }

  if (typeof body.coverImageUrl === "string") {
    const url = body.coverImageUrl.trim();
    const publicId = typeof body.coverImagePublicId === "string" ? body.coverImagePublicId.trim() : "";
    if (url && publicId && !isAllowedCloudinaryUrl(url, [CLOUDINARY_BLOG_FOLDER])) {
      return noStoreJson(
        { ok: false, error: "Uploaded cover image must be in the blog folder." },
        { status: 400 }
      );
    }
    patch.coverImageUrl = url;
    patch.coverImagePublicId = publicId;
  }

  if ("categoryId" in body) {
    const requestedCategoryId = asString(body.categoryId).trim();
    if (!requestedCategoryId) {
      patch.categoryId = null;
      patch.category = "";
    } else {
      if (!ObjectId.isValid(requestedCategoryId)) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }
      const cat = await db
        .collection("blog_categories")
        .findOne({ _id: new ObjectId(requestedCategoryId) }, { projection: { slug: 1 } });
      if (!cat) return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      patch.categoryId = String(cat._id);
      patch.category = typeof cat.slug === "string" ? cat.slug : "";
    }
  }

  const finalPublished =
    typeof body.isPublished === "boolean" ? body.isPublished : existing.isPublished === true;
  if (typeof body.isPublished === "boolean") patch.isPublished = body.isPublished;

  if (typeof body.isPublished === "boolean" || "publishedAt" in body) {
    if (finalPublished) {
      patch.publishedAt =
        asDate(body.publishedAt) ??
        (existing.publishedAt instanceof Date ? existing.publishedAt : new Date());
    } else {
      patch.publishedAt = null;
    }
  }

  const previousImageUrl = typeof existing.coverImageUrl === "string" ? existing.coverImageUrl : "";
  const nextImageUrl = typeof patch.coverImageUrl === "string" ? patch.coverImageUrl : previousImageUrl;

  await db.collection("blog_posts").updateOne({ _id: oid }, { $set: patch });

  if (previousImageUrl && previousImageUrl !== nextImageUrl) {
    await deleteManagedCloudinaryAsset({ url: previousImageUrl }, [CLOUDINARY_BLOG_FOLDER]);
  }

  const oldSlug = typeof existing.slug === "string" ? existing.slug : null;
  const newSlug = typeof patch.slug === "string" ? patch.slug : oldSlug;

  revalidatePath("/blog", "layout");
  if (oldSlug) revalidatePath(`/blog/${oldSlug}`);
  if (newSlug && newSlug !== oldSlug) revalidatePath(`/blog/${newSlug}`);

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "blog_posts", oid);
  if (found instanceof Response) return found;
  const post = found.doc;

  const slug = typeof post.slug === "string" ? post.slug : null;
  const imageUrl = typeof post.coverImageUrl === "string" ? post.coverImageUrl : "";

  await db.collection("blog_posts").deleteOne({ _id: oid });

  if (imageUrl) {
    await deleteManagedCloudinaryAsset({ url: imageUrl }, [CLOUDINARY_BLOG_FOLDER]);
  }

  revalidatePath("/blog", "layout");
  if (slug) revalidatePath(`/blog/${slug}`);

  return noStoreJson({ ok: true });
}
