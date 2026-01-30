import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type MediaType = "image" | "video" | "embed";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
}
function asNumberOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function asIntOrNull(v: unknown): number | null {
  const n = asNumberOrNull(v);
  if (n === null) return null;
  return Math.trunc(n);
}
function asBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

function isHttpsCloudinaryUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host.endsWith("res.cloudinary.com");
  } catch {
    return false;
  }
}

function isCloudinarySecureUrl(raw: string): boolean {
  // same as above, but kept for readability / future tightening
  return isHttpsCloudinaryUrl(raw);
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const typeRaw = (asString(bodyUnknown.type) ?? "").trim();
  const type: MediaType = typeRaw === "video" || typeRaw === "embed" ? typeRaw : "image";

  const title = (asString(bodyUnknown.title) ?? "").trim();
  const description = (asString(bodyUnknown.description) ?? "").trim();
  const location = (asString(bodyUnknown.location) ?? "").trim();
  const event = (asString(bodyUnknown.event) ?? "").trim();
  const year = asIntOrNull(bodyUnknown.year);

  const tags = asStringArray(bodyUnknown.tags);
  const categories = asStringArray(bodyUnknown.categories);
  const people = asStringArray(bodyUnknown.people);

  const secureUrl = (asString(bodyUnknown.secureUrl) ?? "").trim();
  const publicId = (asString(bodyUnknown.publicId) ?? "").trim();
  const resourceType = (asString(bodyUnknown.resourceType) ?? "").trim(); // image|video
  const embedUrl = (asString(bodyUnknown.embedUrl) ?? "").trim();

  const isPublic = asBoolean(bodyUnknown.isPublic) ?? false;

  if (!title) {
    return noStoreJson({ ok: false, error: "Title is required" }, { status: 400 });
  }

  if (type === "embed") {
    if (!embedUrl) {
      return noStoreJson({ ok: false, error: "embedUrl is required for embed items" }, { status: 400 });
    }
  } else {
    if (!secureUrl || !isCloudinarySecureUrl(secureUrl)) {
      return noStoreJson({ ok: false, error: "Invalid secureUrl" }, { status: 400 });
    }
    if (!publicId || !publicId.startsWith("hm_visuals/")) {
      return noStoreJson({ ok: false, error: "Invalid publicId" }, { status: 400 });
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

    // Public visibility (used by list-public)
    isPublic,

    secureUrl: type === "embed" ? null : secureUrl,
    publicId: type === "embed" ? null : publicId,
    resourceType: type === "embed" ? null : resourceType,

    embedUrl: type === "embed" ? embedUrl : null,

    order:
      typeof bodyUnknown.order === "number" && Number.isFinite(bodyUnknown.order)
        ? bodyUnknown.order
        : 0,

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").insertOne(doc);

  return noStoreJson({ ok: true, id: String(result.insertedId) });
}