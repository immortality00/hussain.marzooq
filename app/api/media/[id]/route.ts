import { v2 as cloudinary } from "cloudinary";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";
import { parseNftMeta, sanitizeAppearances } from "@/app/api/_lib/media";

export const dynamic = "force-dynamic";

type PrivateGalleryRecord = {
  mediaIds?: string[];
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("media").findOne({ _id: oid });
  if (!doc) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

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
    nft: doc.nft && typeof doc.nft === "object" ? doc.nft : null,
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };

  return noStoreJson({ ok: true, item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const title = (asNullableString(bodyUnknown.title) ?? "").trim().slice(0, 160);
  if (!title) return noStoreJson({ ok: false, error: "Title required" }, { status: 400 });

  const description = (asNullableString(bodyUnknown.description) ?? "").trim().slice(0, 2000);
  const location = (asNullableString(bodyUnknown.location) ?? "").trim().slice(0, 120);
  const event = (asNullableString(bodyUnknown.event) ?? "").trim().slice(0, 120);

  const yearNum = asNumberOrNull(bodyUnknown.year);
  const year = yearNum !== null && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const tags = asStringArray(bodyUnknown.tags);
  const categories = asStringArray(bodyUnknown.categories);
  const people = asStringArray(bodyUnknown.people);
  const isPublic = asBooleanOrNull(bodyUnknown.isPublic);
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  if (categories.length === 0) {
    return noStoreJson({ ok: false, error: "Choose at least one category." }, { status: 400 });
  }

  const incomingType = asNullableString(bodyUnknown.type);
  const incomingEmbedUrl = asNullableString(bodyUnknown.embedUrl);
  const incomingSecureUrl = asNullableString(bodyUnknown.secureUrl);
  const incomingPublicId = asNullableString(bodyUnknown.publicId);
  const incomingResourceType = asNullableString(bodyUnknown.resourceType);

  if (categories.includes("nft") && incomingType === "embed") {
    return noStoreJson(
      { ok: false, error: "NFT items must use an uploaded image or video." },
      { status: 400 }
    );
  }

  const nftParsed = parseNftMeta(bodyUnknown, categories.includes("nft"));
  if (!nftParsed.ok) {
    return noStoreJson({ ok: false, error: nftParsed.error }, { status: 400 });
  }

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
    nft: nftParsed.value,
    updatedAt: new Date(),
  };

  if (typeof isPublic === "boolean") set.isPublic = isPublic;

  if (incomingType === "embed") {
    const url = (incomingEmbedUrl ?? "").trim();
    if (!url.startsWith("https://")) {
      return noStoreJson({ ok: false, error: "Valid embedUrl required" }, { status: 400 });
    }
    set.type = "embed";
    set.embedUrl = url;
    set.secureUrl = null;
    set.publicId = null;
    set.resourceType = null;
  }

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
    set.type = incomingResourceType === "video" ? "video" : "image";
    set.embedUrl = null;
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("media").findOne({ _id: oid });
  if (!existing) {
    return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });
  }

  const publicId = typeof existing.publicId === "string" ? existing.publicId : "";
  const resourceType =
    typeof existing.resourceType === "string" && existing.resourceType
      ? existing.resourceType
      : typeof existing.type === "string" && existing.type === "video"
        ? "video"
        : "image";

  if (publicId) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
    } catch {
      return noStoreJson(
        {
          ok: false,
          error: "Cloudinary delete failed. Media was not removed from the database.",
        },
        { status: 500 }
      );
    }
  }

  await db.collection("media").deleteOne({ _id: oid });

  await db
    .collection<PrivateGalleryRecord>("private_galleries")
    .updateMany({}, { $pull: { mediaIds: String(oid) } });

  return noStoreJson({ ok: true });
}