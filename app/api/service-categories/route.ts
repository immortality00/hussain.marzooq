// app/api/service-categories/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  const res = NextResponse.json({ ok: true, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const name = asString(body.name).trim();
  const slug = asString(body.slug).trim();

  if (!name || name.length > 120) {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }
  if (!slug || slug.includes(" ") || slug.length > 160) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const exists = await db.collection("service_categories").findOne({ slug });
  if (exists) {
    return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
  }

  const now = new Date();
  const doc = {
    name,
    slug,
    isActive: true,
    order: 0,
    createdAt: now,
    updatedAt: now,
  };

  const r = await db.collection("service_categories").insertOne(doc);

  const res = NextResponse.json({ ok: true, id: String(r.insertedId) }, { status: 201 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}