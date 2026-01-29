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
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 24), 1), 60);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const query: Record<string, unknown> = { isPublic: true };
  if (type && type !== "all") query.type = type;

  const docs = await db
    .collection("media")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const items = docs.map((d) => {
    const asset = isRecord(d.asset) ? d.asset : {};
    return {
      id: String(d._id),
      type: asString(d.type),
      title: asString(d.title) ?? "",
      location: asString(d.location),
      event: asString(d.event),
      year: typeof d.year === "number" ? d.year : null,
      tags: Array.isArray(d.tags) ? d.tags.map((t: unknown) => String(t)) : [],
      secureUrl: asString(asset.secureUrl),
      publicId: asString(asset.publicId),
      embedUrl: asString(asset.embedUrl),
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    };
  });

  const res = NextResponse.json({ items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}