import { ObjectId, type Db } from "mongodb";
import {
  convertAssetDeliveryType,
  normalizeAssetResourceType,
  normalizeDeliveryType,
} from "@/lib/server/cloudinary-private";

type ConversionOutcome = { title: string; error: string };

export type GalleryPrivacyResult = {
  hidden: number;
  converted: number;
  missing: number;
  failures: ConversionOutcome[];
};

function toObjectIds(mediaIds: string[]) {
  return mediaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
}

async function findMediaDocs(db: Db, mediaIds: string[]) {
  const objectIds = toObjectIds(mediaIds);
  if (objectIds.length === 0) return [];

  return db.collection("media").find({ _id: { $in: objectIds } }).toArray();
}

function mediaTitle(doc: Record<string, unknown>) {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  return title || String(doc._id);
}

function isMissingAssetError(message: string) {
  return /deleted resource|not found|resource not found/i.test(message);
}

export async function makeMediaPrivateForGallery(
  db: Db,
  mediaIds: string[]
): Promise<GalleryPrivacyResult> {
  const objectIds = toObjectIds(mediaIds);
  const result: GalleryPrivacyResult = { hidden: 0, converted: 0, missing: 0, failures: [] };

  if (objectIds.length === 0) return result;

  const hidden = await db
    .collection("media")
    .updateMany({ _id: { $in: objectIds } }, { $set: { isPublic: false } });
  result.hidden = hidden.matchedCount;

  const docs = await findMediaDocs(db, mediaIds);

  for (const doc of docs) {
    const publicId = typeof doc.publicId === "string" ? doc.publicId.trim() : "";
    if (!publicId) continue;
    if (normalizeDeliveryType(doc.deliveryType) === "authenticated") continue;

    const converted = await convertAssetDeliveryType({
      publicId,
      resourceType: normalizeAssetResourceType(doc.resourceType ?? doc.type),
      from: "upload",
      to: "authenticated",
    });

    if (!converted.ok) {
      if (isMissingAssetError(converted.error)) {
        result.missing += 1;
        continue;
      }

      result.failures.push({ title: mediaTitle(doc), error: converted.error });
      continue;
    }

    await db
      .collection("media")
      .updateOne(
        { _id: doc._id },
        { $set: { deliveryType: "authenticated", secureUrl: converted.secureUrl } }
      );

    result.converted += 1;
  }

  return result;
}

export async function releaseMediaFromPrivateGalleries(db: Db, mediaIds: string[]) {
  if (mediaIds.length === 0) return;

  const stillUsed = await db
    .collection("private_galleries")
    .distinct("mediaIds", { mediaIds: { $in: mediaIds } });

  const stillUsedSet = new Set(stillUsed.filter((id): id is string => typeof id === "string"));
  const releasable = mediaIds.filter((id) => !stillUsedSet.has(id));
  const docs = await findMediaDocs(db, releasable);

  for (const doc of docs) {
    const publicId = typeof doc.publicId === "string" ? doc.publicId.trim() : "";
    if (!publicId || normalizeDeliveryType(doc.deliveryType) !== "authenticated") continue;

    const converted = await convertAssetDeliveryType({
      publicId,
      resourceType: normalizeAssetResourceType(doc.resourceType ?? doc.type),
      from: "authenticated",
      to: "upload",
    });

    if (!converted.ok) continue;

    await db
      .collection("media")
      .updateOne(
        { _id: doc._id },
        { $set: { deliveryType: "upload", secureUrl: converted.secureUrl } }
      );
  }
}

export function formatGalleryConversionError(failures: ConversionOutcome[]) {
  const details = failures.map((f) => `${f.title} (${f.error})`).join("; ");
  return `These items are now hidden from the public site, but their files could not be switched to private delivery: ${details}. The gallery was not saved — fix those items and save again.`;
}
