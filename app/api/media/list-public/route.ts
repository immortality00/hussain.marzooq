import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const type = url.searchParams.get("type"); // image|video|embed|all
  const category = url.searchParams.get("category")?.trim();
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 24), 1), 60);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  // Backward compatible:
  // - new docs: isPublic: true/false
  // - old docs: missing isPublic -> treated as public
  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  };

  if (type && type !== "all") query.type = type;
  if (category) query.categories = category; // array contains match

  const docs = await db.collection("media").find(query).sort({ createdAt: -1 }).limit(limit).toArray();

  const items = docs.map((d) => {
    const asset = isRecord(d.asset) ? d.asset : {};

    // Support BOTH schemas:
    const secureUrl =
      asString(d.secureUrl) ?? asString(asset.secureUrl) ?? asString((asset as Record<string, unknown>).secure_url);

    const publicId = asString(d.publicId) ?? asString(asset.publicId);
    const embedUrl = asString(d.embedUrl) ?? asString(asset.embedUrl);

    return {
      id: String(d._id),
      type: asString(d.type) ?? "image",
      title: asString(d.title) ?? "",
      location: asString(d.location),
      event: asString(d.event),
      year: typeof d.year === "number" ? d.year : null,
      tags: Array.isArray(d.tags) ? d.tags.map((t: unknown) => String(t)) : [],
      categories: Array.isArray(d.categories) ? d.categories.map((c: unknown) => String(c)) : [],
      secureUrl,
      publicId,
      embedUrl,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    };
  });

  const res = NextResponse.json({ items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}