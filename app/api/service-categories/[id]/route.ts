import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function looksTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "ok" || s.length > 10;
}
async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const knownNames = ["admin", "admin_auth", "admin_session", "admin_token", "hm_admin"];

  for (const name of knownNames) {
    const v = store.get(name)?.value;
    if (typeof v === "string" && looksTruthy(v)) return true;
  }
  for (const c of store.getAll()) {
    const n = c.name.toLowerCase();
    if (n.includes("admin") && looksTruthy(c.value)) return true;
  }
  return false;
}
function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const okAdmin = await isAdminRequest();
  if (!okAdmin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const $set: Record<string, unknown> = { updatedAt: new Date() };

  const name = asString(body.name);
  if (typeof name === "string") {
    const nm = name.trim();
    if (!nm) return NextResponse.json({ ok: false, error: "Name cannot be empty" }, { status: 400 });

    const newSlug = slugify(nm);

    // If slug changes, ensure unique, and migrate services that used old slug
    const oldSlug = typeof existing.slug === "string" ? existing.slug : "";
    if (newSlug && newSlug !== oldSlug) {
      const dup = await db.collection("service_categories").findOne({ slug: newSlug });
      if (dup) {
        return NextResponse.json({ ok: false, error: "Category slug already exists" }, { status: 400 });
      }

      $set.name = nm;
      $set.slug = newSlug;

      // migrate services category string
      if (oldSlug) {
        await db.collection("services").updateMany(
          { category: oldSlug },
          { $set: { category: newSlug, updatedAt: new Date() } }
        );
      }
    } else {
      $set.name = nm;
    }
  }

  const isActive = typeof body.isActive === "boolean" ? body.isActive : null;
  if (isActive !== null) $set.isActive = isActive;

  const order = asNumber(body.order);
  if (order !== null) $set.order = order;

  await db.collection("service_categories").updateOne({ _id: new ObjectId(id) }, { $set });

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const okAdmin = await isAdminRequest();
  if (!okAdmin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const cat = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!cat) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const slug = typeof cat.slug === "string" ? cat.slug : "";

  // Reassign any services using this category to "general" so site doesn't break
  if (slug) {
    await db.collection("services").updateMany(
      { category: slug },
      { $set: { category: "general", updatedAt: new Date() } }
    );
  }

  // Hard delete category
  await db.collection("service_categories").deleteOne({ _id: new ObjectId(id) });

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}