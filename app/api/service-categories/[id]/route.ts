import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeSlug(v: string): string {
  return v.trim().toLowerCase();
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return noStore({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const categoryObjectId = new ObjectId(id);

  const existing = await db.collection("service_categories").findOne({ _id: categoryObjectId });
  if (!existing) {
    return noStore({ ok: false, error: "Not found" }, { status: 404 });
  }

  const existingSlug = typeof existing.slug === "string" ? normalizeSlug(existing.slug) : "others";
  const isSystem = existingSlug === "others" || existing.isSystem === true;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string" && !isSystem) {
    const nextName = body.name.trim();
    if (!nextName) {
      return noStore({ ok: false, error: "Name is required" }, { status: 400 });
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
      return noStore({ ok: false, error: "SYSTEM_CATEGORY_LOCKED" }, { status: 409 });
    }

    nextSlug = normalizeSlug(body.slug);
    if (!nextSlug || nextSlug.includes(" ")) {
      return noStore({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
    if (nextSlug === "others") {
      return noStore({ ok: false, error: "Slug reserved" }, { status: 409 });
    }

    const conflict = await db.collection("service_categories").findOne({
      slug: nextSlug,
      _id: { $ne: categoryObjectId },
    });
    if (conflict) {
      return noStore({ ok: false, error: "Slug already exists" }, { status: 409 });
    }

    patch.slug = nextSlug;
  }

  const willDeactivate =
    typeof patch.isActive === "boolean" && patch.isActive === false && existing.isActive !== false;

  await db.collection("service_categories").updateOne({ _id: categoryObjectId }, { $set: patch });

  const servicePatch: Record<string, unknown> = {
    category: nextSlug,
    updatedAt: new Date(),
  };

  if (willDeactivate) {
    servicePatch.isActive = false;
  }

  await db.collection("services").updateMany(
    { categoryId: id },
    { $set: servicePatch }
  );

  return noStore({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return noStore({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const cat = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!cat) {
    return noStore({ ok: false, error: "Not found" }, { status: 404 });
  }

  const slug = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : "";

  if (slug === "others" || cat.isSystem === true) {
    return noStore({ ok: false, error: "SYSTEM_CATEGORY_CANNOT_DELETE" }, { status: 409 });
  }

  const servicesCount = await db.collection("services").countDocuments({ categoryId: id });

  if (servicesCount > 0) {
    return noStore({ ok: false, error: "CATEGORY_HAS_SERVICES", servicesCount }, { status: 409 });
  }

  await db.collection("service_categories").deleteOne({ _id: new ObjectId(id) });

  return noStore({ ok: true });
}