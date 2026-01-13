import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function isAdminCookie(v: string | undefined): boolean {
  // ✅ accept the value your login sets
  return v === "ok" || v === "1" || v === "true";
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asNumberOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function asBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}
function asNonNegativeInt(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const n = Math.floor(v);
  if (n < 0) return null;
  return n;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  const isAdmin = isAdminCookie(c.get("hm_admin")?.value);
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  const name = asString(body.name);
  if (name !== null) patch.name = name.trim();

  const slug = asString(body.slug);
  if (slug !== null) patch.slug = slug.trim();

  const category = asString(body.category);
  if (category !== null) patch.category = category.trim();

  const description = asString(body.description);
  if (description !== null) patch.description = description.trim();

  const currency = asString(body.currency);
  if (currency !== null) patch.currency = currency.trim().toUpperCase();

  const imageUrl = asString(body.imageUrl);
  if (imageUrl !== null) patch.imageUrl = imageUrl.trim();

  const isActive = asBoolean(body.isActive);
  if (isActive !== null) patch.isActive = isActive;

  if ("startingPrice" in body) {
    const sp = asNumberOrNull((body as Record<string, unknown>).startingPrice);
    patch.startingPrice = sp;
  }

  // ✅ reorder feature uses this
  if ("order" in body) {
    const ord = asNonNegativeInt((body as Record<string, unknown>).order);
    if (ord === null) {
      return NextResponse.json({ ok: false, error: "Invalid order" }, { status: 400 });
    }
    patch.order = ord;
  }

  if (Object.keys(patch).length === 0) {
    const res = NextResponse.json({ ok: true });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  patch.updatedAt = new Date();

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("services").updateOne(
    { _id: new ObjectId(id) },
    { $set: patch }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  const isAdmin = isAdminCookie(c.get("hm_admin")?.value);
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  if (hard) {
    await db.collection("services").deleteOne({ _id: new ObjectId(id) });
  } else {
    await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}