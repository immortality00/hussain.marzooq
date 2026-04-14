import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { isAdminAuthedServer, requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

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
function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantsAll = url.searchParams.get("all") === "1";

  const admin = await isAdminAuthedServer();
  const all = wantsAll && admin;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const filter: Record<string, unknown> = {};
  if (!all) {
    filter.isActive = true;
    filter.isArchived = { $ne: true };
  }

  const docs = await db.collection("services").find(filter).sort({ order: 1, createdAt: -1 }).toArray();

  const items = docs.map((d) => ({
    id: typeof d._id?.toString === "function" ? d._id.toString() : String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    category: typeof d.category === "string" ? d.category : "others",
    description: typeof d.description === "string" ? d.description : "",
    startingPrice: asNumberOrNull(d.startingPrice),
    currency: typeof d.currency === "string" ? d.currency : "AED",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    isArchived: typeof d.isArchived === "boolean" ? d.isArchived : false,
    imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
    order: typeof d.order === "number" && Number.isFinite(d.order) ? d.order : 0,
    inquiriesCount: typeof d.inquiriesCount === "number" && Number.isFinite(d.inquiriesCount) ? d.inquiriesCount : 0,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const name = (asString(bodyUnknown.name) ?? "").trim();
  const slug = (asString(bodyUnknown.slug) ?? "").trim();
  const category = (asString(bodyUnknown.category) ?? "others").trim() || "others";
  const description = (asString(bodyUnknown.description) ?? "").trim();
  const currency = (asString(bodyUnknown.currency) ?? "AED").trim();
  const imageUrl = (asString(bodyUnknown.imageUrl) ?? "").trim();
  const startingPrice = asNumberOrNull(bodyUnknown.startingPrice);

  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  if (!slug) return noStoreJson({ ok: false, error: "Slug is required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("services").findOne({ slug }, { projection: { _id: 1 } });
  if (existing) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db.collection("services").find({}).sort({ order: -1 }).limit(1).toArray();
  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order) ? last[0].order + 1 : 0;

  const r = await db.collection("services").insertOne({
    name,
    slug,
    category,
    description,
    startingPrice,
    currency,
    imageUrl,
    isActive: true,
    isArchived: false,
    order: nextOrder,
    inquiriesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return noStoreJson({ ok: true, id: r.insertedId.toString() });
}