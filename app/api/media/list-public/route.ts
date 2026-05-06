import clientPromise from "@/lib/mongodb";
import { asNullableString, asStringArray, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { sanitizeAppearances } from "@/app/api/_lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const type = url.searchParams.get("type");
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
      asNullableString(d.secureUrl) ??
      asNullableString(asset.secureUrl) ??
      asNullableString((asset as Record<string, unknown>).secure_url);

    const publicId = asNullableString(d.publicId) ?? asNullableString(asset.publicId);
    const embedUrl = asNullableString(d.embedUrl) ?? asNullableString(asset.embedUrl);

    return {
      id: String(d._id),
      type: asNullableString(d.type) ?? "image",
      title: asNullableString(d.title) ?? "",
      description: asNullableString(d.description),
      location: asNullableString(d.location),
      event: asNullableString(d.event),
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

  return noStoreJson({ items });
}