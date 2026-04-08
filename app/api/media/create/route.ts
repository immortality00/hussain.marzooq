import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type MediaType = "image" | "video" | "embed";
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string").map((s) => s.trim()).filter(Boolean).slice(0, 50);
}
function asBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

function isCloudinarySecureUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");
    return host.endsWith("res.cloudinary.com");
  } catch {
    return false;
  }
}

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

    // Require at least a title or venue (so empty rows don’t pollute)
    if (!title && !venue) continue;

    out.push({
      kind,
      title,
      venue,
      city,
      country,
      dateFrom,
      dateTo,
      notes,
      link,
    });

    if (out.length >= 20) break; // safety
  }

  return out;
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) return noStore({ ok: false, error: "Invalid body" }, { status: 400 });

  const typeRaw = asString(bodyUnknown.type).trim();
  const type: MediaType = typeRaw === "video" || typeRaw === "embed" ? typeRaw : "image";

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

  const isPublic = asBoolean(bodyUnknown.isPublic) ?? true;
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  const secureUrl = asString(bodyUnknown.secureUrl).trim();
  const publicId = asString(bodyUnknown.publicId).trim();
  const resourceType = asString(bodyUnknown.resourceType).trim();
  const embedUrl = asString(bodyUnknown.embedUrl).trim();

  if (type === "embed") {
    if (!embedUrl) return noStore({ ok: false, error: "embedUrl required" }, { status: 400 });
  } else {
    if (!secureUrl || !isCloudinarySecureUrl(secureUrl)) {
      return noStore({ ok: false, error: "Invalid secureUrl" }, { status: 400 });
    }
    if (!publicId) return noStore({ ok: false, error: "publicId required" }, { status: 400 });
    if (resourceType !== "image" && resourceType !== "video" && resourceType !== "auto") {
      return noStore({ ok: false, error: "Invalid resourceType" }, { status: 400 });
    }
  }

  const doc = {
    type,
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,

    tags,
    categories,
    people,

    isPublic,
    appearances,

    secureUrl: type === "embed" ? null : secureUrl,
    publicId: type === "embed" ? null : publicId,
    resourceType: type === "embed" ? null : resourceType,

    embedUrl: type === "embed" ? embedUrl : null,

    order: typeof bodyUnknown.order === "number" && Number.isFinite(bodyUnknown.order) ? bodyUnknown.order : 0,

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const result = await db.collection("media").insertOne(doc);

  return noStore({ ok: true, id: String(result.insertedId) });
}