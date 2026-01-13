import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const filter: Record<string, unknown> = {};
  if (!all) filter.isActive = true;

  const docs = await db
    .collection("services")
    .find(filter)
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((d) => ({
    id: typeof d._id?.toString === "function" ? d._id.toString() : String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    category: typeof d.category === "string" ? d.category : "general",
    description: typeof d.description === "string" ? d.description : "",
    startingPrice: asNumberOrNull(d.startingPrice),
    currency: typeof d.currency === "string" ? d.currency : "AED",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
    order: typeof d.order === "number" && Number.isFinite(d.order) ? d.order : 0,
    inquiriesCount: typeof d.inquiriesCount === "number" && Number.isFinite(d.inquiriesCount) ? d.inquiriesCount : 0,
  }));

  const res = NextResponse.json({ ok: true, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  const c = await cookies();
  const isAdmin = isAdminCookie(c.get("hm_admin")?.value);
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const name = (asString(body.name) ?? "").trim();
  const category = (asString(body.category) ?? "").trim();
  const description = (asString(body.description) ?? "").trim();
  const currency = (asString(body.currency) ?? "AED").trim().toUpperCase();
  const imageUrl = (asString(body.imageUrl) ?? "").trim();

  const startingPrice =
    "startingPrice" in body ? asNumberOrNull((body as Record<string, unknown>).startingPrice) : null;

  if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  if (!category) return NextResponse.json({ ok: false, error: "Category is required" }, { status: 400 });

  const slug = (asString(body.slug) ?? "").trim();

  const client = await clientPromise;
  const db = client.db("hm_visuals");

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const r = await db.collection("services").insertOne(doc);

  const res = NextResponse.json({ ok: true, id: r.insertedId.toString() });
  res.headers.set("Cache-Control", "no-store");
  return res;
}