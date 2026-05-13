import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { isAdminAuthedServer, requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function normalizeMediaType(v: string | null): "image" | "video" {
  return v === "video" ? "video" : "image";
}

function normalizeEditionType(v: string | null): "1/1" | "limited" | "open" {
  if (v === "limited" || v === "open") return v;
  return "1/1";
}

function normalizeStatus(v: string | null): "available" | "sold" | "coming-soon" {
  if (v === "sold" || v === "coming-soon") return v;
  return "available";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantsAll = url.searchParams.get("all") === "1";
  const admin = await isAdminAuthedServer();
  const all = wantsAll && admin;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const filter: Record<string, unknown> = all ? {} : { isPublished: true };
  const docs = await db.collection("nft_items").find(filter).sort({ order: 1, createdAt: -1 }).toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    description: typeof d.description === "string" ? d.description : "",
    mediaUrl: typeof d.mediaUrl === "string" ? d.mediaUrl : "",
    mediaType: normalizeMediaType(asNullableString(d.mediaType)),
    price: asNumberOrNull(d.price),
    currency: typeof d.currency === "string" ? d.currency : "ETH",
    editionType: normalizeEditionType(asNullableString(d.editionType)),
    editionsTotal: asNumberOrNull(d.editionsTotal),
    editionsRemaining: asNumberOrNull(d.editionsRemaining),
    status: normalizeStatus(asNullableString(d.status)),
    marketplaceName: asNullableString(d.marketplaceName),
    marketplaceUrl: asNullableString(d.marketplaceUrl),
    isPublished: typeof d.isPublished === "boolean" ? d.isPublished : true,
    order: typeof d.order === "number" && Number.isFinite(d.order) ? d.order : 0,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const name = (asNullableString(bodyUnknown.name) ?? "").trim();
  const slug = normalizeSlug(asNullableString(bodyUnknown.slug) ?? "");
  const description = (asNullableString(bodyUnknown.description) ?? "").trim();
  const mediaUrl = (asNullableString(bodyUnknown.mediaUrl) ?? "").trim();
  const mediaType = normalizeMediaType(asNullableString(bodyUnknown.mediaType));
  const price = asNumberOrNull(bodyUnknown.price);
  const currency = (asNullableString(bodyUnknown.currency) ?? "ETH").trim() || "ETH";
  const editionType = normalizeEditionType(asNullableString(bodyUnknown.editionType));
  const editionsTotal = asNumberOrNull(bodyUnknown.editionsTotal);
  const editionsRemaining = asNumberOrNull(bodyUnknown.editionsRemaining);
  const status = normalizeStatus(asNullableString(bodyUnknown.status));
  const marketplaceName = (asNullableString(bodyUnknown.marketplaceName) ?? "").trim() || null;
  const marketplaceUrl = (asNullableString(bodyUnknown.marketplaceUrl) ?? "").trim() || null;
  const isPublished = asBooleanOrNull(bodyUnknown.isPublished) ?? true;

  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  if (!slug || slug.includes(" ")) return noStoreJson({ ok: false, error: "Slug is required" }, { status: 400 });
  if (!mediaUrl) return noStoreJson({ ok: false, error: "Media is required" }, { status: 400 });
  if (marketplaceUrl && !marketplaceUrl.startsWith("https://")) {
    return noStoreJson({ ok: false, error: "Marketplace URL must start with https://" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("nft_items").findOne({ slug }, { projection: { _id: 1 } });
  if (existing) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db.collection("nft_items").find({}).sort({ order: -1 }).limit(1).toArray();
  const nextOrder = last.length && typeof last[0]?.order === "number" ? last[0].order + 1 : 0;

  const now = new Date();
  const result = await db.collection("nft_items").insertOne({
    name,
    slug,
    description,
    mediaUrl,
    mediaType,
    price,
    currency,
    editionType,
    editionsTotal,
    editionsRemaining,
    status,
    marketplaceName,
    marketplaceUrl,
    isPublished,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true, id: String(result.insertedId) });
}