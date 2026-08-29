import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import {
  findByIdOr404,
  requireAdminObjectId,
} from "@/app/api/_lib/admin-route";
import {
  asFiniteNumber,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { slugifyTag, isValidTagSlug } from "@/lib/server/media-tags";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const db = await getDb();
  const found = await findByIdOr404(db, "blog_categories", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
    patch.name = name;
  }

  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  let newSlug: string | null = null;
  if (typeof body.slug === "string") {
    const slug = slugifyTag(body.slug);
    if (!slug || !isValidTagSlug(slug)) {
      return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
    const conflict = await db
      .collection("blog_categories")
      .findOne({ slug, _id: { $ne: oid } }, { projection: { _id: 1 } });
    if (conflict) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
    patch.slug = slug;
    newSlug = slug;
  }

  await db.collection("blog_categories").updateOne({ _id: oid }, { $set: patch });

  const oldSlug = typeof existing.slug === "string" ? existing.slug : null;
  if (newSlug && newSlug !== oldSlug) {
    await db
      .collection("blog_posts")
      .updateMany({ categoryId: id }, { $set: { category: newSlug, updatedAt: new Date() } });
  }

  revalidatePath("/blog", "layout");

  return noStoreJson({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const detach = new URL(req.url).searchParams.get("detach") === "1";

  const db = await getDb();
  const found = await findByIdOr404(db, "blog_categories", oid);
  if (found instanceof Response) return found;

  const postsCount = await db.collection("blog_posts").countDocuments({ categoryId: id });
  if (postsCount > 0 && !detach) {
    return noStoreJson({ ok: false, error: "CATEGORY_IN_USE", postsCount }, { status: 409 });
  }

  if (postsCount > 0) {
    await db
      .collection("blog_posts")
      .updateMany({ categoryId: id }, { $set: { categoryId: null, category: "", updatedAt: new Date() } });
  }

  await db.collection("blog_categories").deleteOne({ _id: oid });

  revalidatePath("/blog", "layout");

  return noStoreJson({ ok: true });
}
