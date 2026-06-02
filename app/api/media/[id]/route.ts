import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";
import {
  parseNftMeta,
  resolvePeopleSelection,
  sanitizeAppearances,
} from "@/app/api/_lib/media";
import { toEmbedUrl } from "@/components/media/utils";

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

  const db = await getDb();
  const doc = await db.collection("media").findOne({ _id: oid });

  if (!doc) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const rawPeopleIds = asStringArray(doc.peopleIds);
  const rawPeople = asStringArray(doc.people);
  const resolvedPeople = await resolvePeopleSelection(db, {
    peopleIds: rawPeopleIds,
    people: rawPeople,
  });

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
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people.length ? resolvedPeople.people : rawPeople,
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
  const peopleIds = asStringArray(bodyUnknown.peopleIds);
  const legacyPeople = asStringArray(bodyUnknown.people);
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

  const allowEmbed =
    categories.includes("videography") &&
    !categories.includes("photography") &&
    !categories.includes("nft");

  if (incomingType === "embed" && !allowEmbed) {
    return noStoreJson(
      {
        ok: false,
        error: "Embed links are allowed only for videography.",
      },
      { status: 400 }
    );
  }

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

  const db = await getDb();
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds, people: legacyPeople });

  const set: Record<string, unknown> = {
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,
    tags,
    categories,
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people,
    appearances,
    nft: nftParsed.value,
    updatedAt: new Date(),
  };

  if (typeof isPublic === "boolean") set.isPublic = isPublic;

  if (incomingType === "embed") {
    const normalizedEmbedUrl = toEmbedUrl((incomingEmbedUrl ?? "").trim());
    if (!normalizedEmbedUrl) {
      return noStoreJson(
        { ok: false, error: "Use a valid YouTube or Vimeo video URL." },
        { status: 400 }
      );
    }

    set.type = "embed";
    set.embedUrl = normalizedEmbedUrl;
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

  const db = await getDb();
  const media = await db.collection("media").findOne({ _id: oid });
  if (!media) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const publicId = typeof media.publicId === "string" ? media.publicId : "";
  const resourceType =
    typeof media.resourceType === "string" && media.resourceType
      ? media.resourceType
      : typeof media.type === "string" && media.type === "video"
        ? "video"
        : "image";

  const galleryDocs = await db
    .collection("private_galleries")
    .find({ mediaIds: String(oid) })
    .project({ _id: 1, mediaIds: 1 })
    .toArray();

  if (galleryDocs.length > 0) {
    await Promise.all(
      galleryDocs.map((galleryDoc) => {
        const currentMediaIds = Array.isArray((galleryDoc as PrivateGalleryRecord).mediaIds)
          ? ((galleryDoc as PrivateGalleryRecord).mediaIds ?? []).filter(
              (value): value is string => typeof value === "string"
            )
          : [];

        return db.collection("private_galleries").updateOne(
          { _id: galleryDoc._id as ObjectId },
          {
            $set: {
              mediaIds: currentMediaIds.filter((value) => value !== String(oid)),
              updatedAt: new Date(),
            },
          }
        );
      })
    );
  }

  const result = await db.collection("media").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Delete failed" }, { status: 500 });

  if (publicId) {
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim();

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType === "video" ? "video" : "image",
          invalidate: true,
        });
      } catch {}
    }
  }

  return noStoreJson({ ok: true });
}