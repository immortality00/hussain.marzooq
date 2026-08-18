import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { asFiniteNumber, isRecord, noStoreJson } from "@/app/api/_lib/common";
import {
  isReservedTagSlug,
  isValidTagSlug,
  sanitizeDisciplines,
  slugifyTag,
} from "@/lib/server/media-tags";

export const dynamic = "force-dynamic";

function revalidateTagSurfaces() {
  revalidatePath("/photography", "layout");
  revalidatePath("/videography", "layout");
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const db = await getDb();

  const found = await findByIdOr404(db, "media_tags", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const existingSlug = typeof existing.slug === "string" ? existing.slug : "";
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.label === "string") {
    const nextLabel = body.label.trim();
    if (!nextLabel) return noStoreJson({ ok: false, error: "Label is required" }, { status: 400 });
    patch.label = nextLabel;
  }

  if (typeof body.description === "string") {
    patch.description = body.description.trim();
  }

  if (Array.isArray(body.disciplines)) {
    patch.disciplines = sanitizeDisciplines(body.disciplines);
  }

  if (typeof body.isActive === "boolean") {
    patch.isActive = body.isActive;
  }

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  let nextSlug = existingSlug;

  if (typeof body.slug === "string") {
    nextSlug = slugifyTag(body.slug);
    if (!nextSlug || !isValidTagSlug(nextSlug)) {
      return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
    if (isReservedTagSlug(nextSlug)) {
      return noStoreJson({ ok: false, error: "Slug reserved" }, { status: 409 });
    }

    if (nextSlug !== existingSlug) {
      const conflict = await db
        .collection("media_tags")
        .findOne({ slug: nextSlug, _id: { $ne: oid } }, { projection: { _id: 1 } });
      if (conflict) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
      patch.slug = nextSlug;
    }
  }

  await db.collection("media_tags").updateOne({ _id: oid }, { $set: patch });

  if (nextSlug !== existingSlug && existingSlug) {
    await db.collection("media").updateMany(
      { tags: existingSlug },
      { $set: { "tags.$[e]": nextSlug } },
      { arrayFilters: [{ e: existingSlug }] }
    );
  }

  revalidateTagSurfaces();

  return noStoreJson({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();

  const found = await findByIdOr404(db, "media_tags", oid);
  if (found instanceof Response) return found;
  const slug = typeof found.doc.slug === "string" ? found.doc.slug : "";

  const detach = new URL(req.url).searchParams.get("detach") === "1";
  const usedBy = slug ? await db.collection("media").countDocuments({ tags: slug }) : 0;

  if (usedBy > 0 && !detach) {
    return noStoreJson({ ok: false, error: "TAG_IN_USE", usedBy }, { status: 409 });
  }

  if (usedBy > 0 && slug) {
    await db
      .collection<{ tags: string[] }>("media")
      .updateMany({ tags: slug }, { $pull: { tags: slug } });
  }

  await db.collection("media_tags").deleteOne({ _id: oid });

  revalidateTagSurfaces();

  return noStoreJson({ ok: true, detached: usedBy });
}
