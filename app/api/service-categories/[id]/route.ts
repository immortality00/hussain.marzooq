import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import {
  asFiniteNumber,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const db = await getDb();

  const found = await findByIdOr404(db, "service_categories", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const existingSlug = typeof existing.slug === "string" ? normalizeSlug(existing.slug) : "others";
  const isSystem = existingSlug === "others" || existing.isSystem === true;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string" && !isSystem) {
    const nextName = body.name.trim();
    if (!nextName) {
      return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
    }
    patch.name = nextName;
  }

  if (typeof body.isActive === "boolean") {
    patch.isActive = body.isActive;
  }

  const order = asFiniteNumber(body.order);
  if (order !== null) {
    patch.order = order;
  }

  let nextSlug = existingSlug;

  if (typeof body.slug === "string") {
    if (isSystem) {
      return noStoreJson({ ok: false, error: "SYSTEM_CATEGORY_LOCKED" }, { status: 409 });
    }

    nextSlug = normalizeSlug(body.slug);
    if (!nextSlug || nextSlug.includes(" ")) {
      return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
    if (nextSlug === "others") {
      return noStoreJson({ ok: false, error: "Slug reserved" }, { status: 409 });
    }

    const conflict = await db.collection("service_categories").findOne({
      slug: nextSlug,
      _id: { $ne: oid },
    });

    if (conflict) {
      return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
    }

    patch.slug = nextSlug;
  }

  const willDeactivate =
    typeof patch.isActive === "boolean" && patch.isActive === false && existing.isActive !== false;

  await db.collection("service_categories").updateOne({ _id: oid }, { $set: patch });

  const servicePatch: Record<string, unknown> = {
    category: nextSlug,
    updatedAt: new Date(),
  };

  if (willDeactivate) {
    servicePatch.isActive = false;
  }

  await db.collection("services").updateMany({ categoryId: id }, { $set: servicePatch });

  revalidatePath("/services", "layout");
  revalidatePath("/");

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const db = await getDb();

  const found = await findByIdOr404(db, "service_categories", oid);
  if (found instanceof Response) return found;
  const cat = found.doc;

  const slug = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : "";

  if (slug === "others" || cat.isSystem === true) {
    return noStoreJson(
      { ok: false, error: "SYSTEM_CATEGORY_CANNOT_DELETE" },
      { status: 409 }
    );
  }

  const servicesCount = await db.collection("services").countDocuments({ categoryId: id });

  if (servicesCount > 0) {
    return noStoreJson(
      { ok: false, error: "CATEGORY_HAS_SERVICES", servicesCount },
      { status: 409 }
    );
  }

  await db.collection("service_categories").deleteOne({ _id: oid });

  revalidatePath("/services", "layout");

  return noStoreJson({ ok: true });
}