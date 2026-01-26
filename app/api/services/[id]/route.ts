// app/api/services/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.slug === "string") patch.slug = body.slug.trim();
  if (typeof body.category === "string") patch.category = body.category.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.currency === "string") patch.currency = body.currency.trim();
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl.trim();
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

  // startingPrice can be null or number
  if (body.startingPrice === null) patch.startingPrice = null;
  else {
    const sp = asNumberOrNull(body.startingPrice);
    if (sp !== null) patch.startingPrice = sp;
  }

  // order is number
  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  // Validate slug if provided
  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    if (!slug || slug.includes(" ") || slug.length > 160) {
      return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  // Enforce slug uniqueness if slug changes
  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    const existing = await db.collection("services").findOne({
      slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
    }
  }

  await db.collection("services").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
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