import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { asNullableString, asStringArray, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { sanitizeAppearances } from "@/app/api/_lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 80), 1), 200);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db.collection("media").find({}).sort({ createdAt: -1 }).limit(limit).toArray();

  const items = docs.map((d) => {
    const asset = isRecord(d.asset) ? d.asset : {};

    const secureUrl =
      asNullableString(d.secureUrl) ??
      asNullableString(asset.secureUrl) ??
      asNullableString((asset as Record<string, unknown>).secure_url);

    const publicId = asNullableString(d.publicId) ?? asNullableString(asset.publicId);
    const resourceType =
      asNullableString(d.resourceType) ??
      asNullableString(asset.resourceType) ??
      asNullableString(asset.resource_type);
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
      nft: d.nft && typeof d.nft === "object" ? d.nft : null,
      isPublic: typeof d.isPublic === "boolean" ? d.isPublic : true,
      secureUrl: secureUrl ?? null,
      publicId: publicId ?? null,
      resourceType: resourceType ?? null,
      embedUrl: embedUrl ?? null,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
    };
  });

  return noStoreJson({ ok: true, items });
}