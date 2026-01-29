import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type MediaType = "image" | "video" | "embed";

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

function isSafeEmbedUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");

    // Allow YouTube + Vimeo (extend later if needed)
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") return true;
    if (host === "vimeo.com" || host === "player.vimeo.com") return true;

    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const type = asString(body.type) as MediaType;
  if (type !== "image" && type !== "video" && type !== "embed") {
    const res = NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const title = asString(body.title).trim().slice(0, 160);
  const description = asString(body.description).trim().slice(0, 2000);
  const location = asString(body.location).trim().slice(0, 120);
  const event = asString(body.event).trim().slice(0, 120);

  const yearNum = typeof body.year === "number" ? body.year : Number(asString(body.year));
  const year = Number.isFinite(yearNum) && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const tags = asStringArray(body.tags);
  const categories = asStringArray(body.categories);
  const people = asStringArray(body.people);

  // Media payload fields
  const secureUrl = asString(body.secureUrl).trim();
  const publicId = asString(body.publicId).trim();
  const resourceType = asString(body.resourceType).trim(); // image|video
  const embedUrl = asString(body.embedUrl).trim();

  if (!title) {
    const res = NextResponse.json({ ok: false, error: "Title required" }, { status: 400 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (type === "embed") {
    if (!embedUrl || !isSafeEmbedUrl(embedUrl)) {
      const res = NextResponse.json({ ok: false, error: "Invalid embedUrl" }, { status: 400 });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
  } else {
    // image/video
    if (!secureUrl || !isCloudinarySecureUrl(secureUrl)) {
      const res = NextResponse.json({ ok: false, error: "Invalid secureUrl" }, { status: 400 });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
    if (!publicId || !publicId.startsWith("hm_visuals/")) {
      const res = NextResponse.json({ ok: false, error: "Invalid publicId" }, { status: 400 });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
    if (resourceType !== "image" && resourceType !== "video") {
      const res = NextResponse.json({ ok: false, error: "Invalid resourceType" }, { status: 400 });
      res.headers.set("Cache-Control", "no-store");
      return res;
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

    secureUrl: type === "embed" ? null : secureUrl,
    publicId: type === "embed" ? null : publicId,
    resourceType: type === "embed" ? null : resourceType,

    embedUrl: type === "embed" ? embedUrl : null,

    order: typeof body.order === "number" && Number.isFinite(body.order) ? body.order : 0,

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").insertOne(doc);

  const res = NextResponse.json({ ok: true, id: String(result.insertedId) });
  res.headers.set("Cache-Control", "no-store");
  return res;
}