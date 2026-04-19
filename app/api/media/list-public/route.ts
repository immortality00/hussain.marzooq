import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x)))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
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

    out.push({
      kind,
      title: asString(item.title) ?? "",
      venue: asString(item.venue) ?? "",
      city: asString(item.city) ?? "",
      country: asString(item.country) ?? "",
      dateFrom: asString(item.dateFrom) ?? "",
      dateTo: asString(item.dateTo) ?? "",
      notes: asString(item.notes) ?? "",
      link: asString(item.link) ?? "",
    });

    if (out.length >= 50) break;
  }
  return out;
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const type = url.searchParams.get("type"); // image|video|embed|all
  const category = url.searchParams.get("category")?.trim();
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 24), 1), 60);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  };

  if (type && type !== "all") query.type = type;
  if (category) query.categories = category;

  const docs = await db.collection("media").find(query).sort({ createdAt: -1 }).limit(limit).toArray();

  const items = docs.map((d) => {
    const asset = isRecord(d.asset) ? d.asset : {};

    const secureUrl =
      asString(d.secureUrl) ?? asString(asset.secureUrl) ?? asString((asset as Record<string, unknown>).secure_url);

    const publicId = asString(d.publicId) ?? asString(asset.publicId);
    const embedUrl = asString(d.embedUrl) ?? asString(asset.embedUrl);

    return {
      id: String(d._id),
      type: asString(d.type) ?? "image",
      title: asString(d.title) ?? "",
      description: asString(d.description),
      location: asString(d.location),
      event: asString(d.event),
      year: typeof d.year === "number" ? d.year : null,
      tags: asStringArray(d.tags),
      categories: asStringArray(d.categories),
      people: asStringArray(d.people),
      appearances: sanitizeAppearances(d.appearances),
      secureUrl: secureUrl ?? null,
      publicId,
      embedUrl,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    };
  });

  return noStore({ items });
}