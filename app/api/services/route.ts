// app/api/services/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401, isAdminAuthedServer } from "@/lib/auth/admin";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantsAll = url.searchParams.get("all") === "1";
  const isAdmin = await isAdminAuthedServer();

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const filter: Record<string, unknown> = {};
  if (!(wantsAll && isAdmin)) filter.isActive = true;

  const docs = await db
    .collection("services")
    .find(filter)
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    category: typeof d.category === "string" ? d.category : "general",
    description: typeof d.description === "string" ? d.description : "",
    startingPrice: typeof d.startingPrice === "number" ? d.startingPrice : null,
    currency: typeof d.currency === "string" ? d.currency : "AED",
    imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
    inquiriesCount: typeof d.inquiriesCount === "number" ? d.inquiriesCount : 0,
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
  const category = asString(body.category).trim() || "general";
  const description = asString(body.description).trim();
  const currency = asString(body.currency).trim() || "AED";
  const imageUrl = asString(body.imageUrl).trim();
  const startingPrice = asNumberOrNull(body.startingPrice);

  if (!name || name.length > 120) {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }
  if (!slug || slug.length > 160 || slug.includes(" ")) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const exists = await db.collection("services").findOne({ slug });
  if (exists) {
    return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
  }

  const now = new Date();
  const doc = {
    name,
    slug,
    category,
    description,
    startingPrice,
    currency,
    imageUrl,
    isActive: true,
    order: 0,
    inquiriesCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const r = await db.collection("services").insertOne(doc);

  const res = NextResponse.json({ ok: true, id: String(r.insertedId) }, { status: 201 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}