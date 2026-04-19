import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x)))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
}
function asBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

function sanitizeAppearances(v: unknown): Appearance[] {
  if (!Array.isArray(v)) return [];
  const out: Appearance[] = [];

  for (const item of v) {
    if (!isRecord(item)) continue;

    const kindRaw = asString(item.kind);
    const kind = kindRaw === "featured" ? "featured" : kindRaw === "exhibited" ? "exhibited" : null;
    if (!kind) continue;

    const title = asString(item.title).trim().slice(0, 160);
    const venue = asString(item.venue).trim().slice(0, 160);
    const city = asString(item.city).trim().slice(0, 120);
    const country = asString(item.country).trim().slice(0, 120);
    const dateFrom = asString(item.dateFrom).trim().slice(0, 32);
    const dateTo = asString(item.dateTo).trim().slice(0, 32);
    const notes = asString(item.notes).trim().slice(0, 2000);
    const link = asString(item.link).trim().slice(0, 500);

    if (!title && !venue) continue;

    out.push({ kind, title, venue, city, country, dateFrom, dateTo, notes, link });
    if (out.length >= 50) break;
  }

  return out;
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function parseId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseId(id);
  if (!oid) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("media").findOne({ _id: oid });
  if (!doc) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  const item = {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: asStringArray(doc.tags),
    categories: asStringArray(doc.categories),
    people: asStringArray(doc.people),
    appearances: sanitizeAppearances(doc.appearances),
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };

  return noStore({ ok: true, item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseId(id);
  if (!oid) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) return noStore({ ok: false, error: "Invalid body" }, { status: 400 });

  const title = asString(bodyUnknown.title).trim().slice(0, 160);
  if (!title) return noStore({ ok: false, error: "Title required" }, { status: 400 });

  const description = asString(bodyUnknown.description).trim().slice(0, 2000);
  const location = asString(bodyUnknown.location).trim().slice(0, 120);
  const event = asString(bodyUnknown.event).trim().slice(0, 120);

  const yearNum = typeof bodyUnknown.year === "number" ? bodyUnknown.year : Number(asString(bodyUnknown.year));
  const year = Number.isFinite(yearNum) && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const tags = asStringArray(bodyUnknown.tags);
  const categories = asStringArray(bodyUnknown.categories);
  const people = asStringArray(bodyUnknown.people);
  const isPublic = asBoolean(bodyUnknown.isPublic);
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  // asset / mode switches
  const incomingType = asStringOrNull(bodyUnknown.type); // "embed" | "image" | "video" maybe
  const incomingEmbedUrl = asStringOrNull(bodyUnknown.embedUrl);
  const incomingSecureUrl = asStringOrNull(bodyUnknown.secureUrl);
  const incomingPublicId = asStringOrNull(bodyUnknown.publicId);
  const incomingResourceType = asStringOrNull(bodyUnknown.resourceType);

  const set: Record<string, unknown> = {
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,
    tags,
    categories,
    people,
    appearances,
    updatedAt: new Date(),
  };

  if (typeof isPublic === "boolean") set.isPublic = isPublic;

  // ✅ If switching to embed mode
  if (incomingType === "embed") {
    const url = (incomingEmbedUrl ?? "").trim();
    if (!url.startsWith("https://")) {
      return noStore({ ok: false, error: "Valid embedUrl required" }, { status: 400 });
    }
    set.type = "embed";
    set.embedUrl = url;

    // clear asset fields
    set.secureUrl = null;
    set.publicId = null;
    set.resourceType = null;
  }

  // ✅ If asset fields are provided, update them (this is what fixes your bug)
  const hasNewAsset =
    typeof incomingSecureUrl === "string" &&
    incomingSecureUrl.length > 0 &&
    typeof incomingPublicId === "string" &&
    incomingPublicId.length > 0 &&
    typeof incomingResourceType === "string" &&
    incomingResourceType.length > 0;

  if (hasNewAsset) {
    set.secureUrl = incomingSecureUrl;
    set.publicId = incomingPublicId;
    set.resourceType = incomingResourceType;

    // set type based on resourceType
    set.type = incomingResourceType === "video" ? "video" : "image";

    // if switching away from embed, clear embedUrl
    set.embedUrl = null;
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  return noStore({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseId(id);
  if (!oid) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  return noStore({ ok: true });
}