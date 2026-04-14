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
function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!existing) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  const isSystem = existing.slug === "others" || existing.isSystem === true;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string" && !isSystem) patch.name = body.name.trim();
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  if (typeof body.slug === "string") {
    if (isSystem) {
      return noStore({ ok: false, error: "SYSTEM_CATEGORY_LOCKED" }, { status: 409 });
    }
    const newSlug = body.slug.trim();
    if (!newSlug || newSlug.includes(" ")) return noStore({ ok: false, error: "Invalid slug" }, { status: 400 });
    if (newSlug === "others") return noStore({ ok: false, error: "Slug reserved" }, { status: 409 });

    const conflict = await db.collection("service_categories").findOne({
      slug: newSlug,
      _id: { $ne: new ObjectId(id) },
    });
    if (conflict) return noStore({ ok: false, error: "Slug already exists" }, { status: 409 });

    patch.slug = newSlug;
  }

  const willDeactivate =
    typeof patch.isActive === "boolean" && patch.isActive === false && existing.isActive !== false;

  const oldSlug = typeof existing.slug === "string" ? existing.slug : null;

  await db.collection("service_categories").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  if (willDeactivate && oldSlug) {
    await db.collection("services").updateMany(
      { category: oldSlug },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }

  return noStore({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const cat = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!cat) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  if (cat.slug === "others" || cat.isSystem === true) {
    return noStore({ ok: false, error: "SYSTEM_CATEGORY_CANNOT_DELETE" }, { status: 409 });
  }

  const slug = typeof cat.slug === "string" ? cat.slug : "";
  const servicesCount = await db.collection("services").countDocuments({ category: slug });

  if (servicesCount > 0) {
    return noStore({ ok: false, error: "CATEGORY_HAS_SERVICES", servicesCount }, { status: 409 });
  }

  await db.collection("service_categories").deleteOne({ _id: new ObjectId(id) });

  return noStore({ ok: true });
}