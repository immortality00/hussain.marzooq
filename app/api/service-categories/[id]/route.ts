// app/api/service-categories/[id]/route.ts
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
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    if (!slug || slug.includes(" ") || slug.length > 160) {
      return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
    }
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    const existing = await db.collection("service_categories").findOne({
      slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
    }
  }

  await db.collection("service_categories").updateOne(
    { _id: new ObjectId(id) },
    { $set: patch }
  );

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("service_categories").deleteOne({ _id: new ObjectId(id) });

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}