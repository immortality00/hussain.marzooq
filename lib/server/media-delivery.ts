import { ObjectId, type Db, type Document } from "mongodb";
import {
  convertAssetDeliveryType,
  normalizeAssetResourceType,
  normalizeDeliveryType,
  type CloudinaryDeliveryType,
} from "@/lib/server/cloudinary-private";
import { settleLimited } from "@/lib/settle-limited";

// A few at a time: a person or gallery with many photos still saves well inside the
// server's time limit, and a cut-off save is finished by the next one.
const CONVERSION_LIMIT = 4;

export type DeliveryFailure = { title: string; error: string; to: CloudinaryDeliveryType };

export type DeliverySyncResult = { converted: number; missing: number; failures: DeliveryFailure[] };

// The one rule: a hidden item, or one in a Private Gallery, is served only through the
// site, so an address saved while it was public stops working.
export function requiredDelivery(doc: Document, inGallery: boolean): CloudinaryDeliveryType {
  return inGallery || doc.isPublic === false ? "authenticated" : "upload";
}

export async function privateGalleryMediaIds(db: Db, mediaIds: string[]): Promise<Set<string>> {
  if (mediaIds.length === 0) return new Set();
  const ids = await db.collection("private_galleries").distinct("mediaIds", { mediaIds: { $in: mediaIds } });
  return new Set(ids.filter((id): id is string => typeof id === "string"));
}

export function isMissingAssetError(message: string) {
  return /deleted resource|not found|resource not found/i.test(message);
}

function mediaTitle(doc: Document) {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  return title || String(doc._id);
}

function toObjectIds(mediaIds: string[]) {
  const unique = Array.from(new Set(mediaIds.filter((id) => ObjectId.isValid(id))));
  return unique.map((id) => new ObjectId(id));
}

async function switchDelivery(db: Db, doc: Document, to: CloudinaryDeliveryType) {
  const publicId = String(doc.publicId);
  const converted = await convertAssetDeliveryType({
    publicId,
    resourceType: normalizeAssetResourceType(doc.resourceType ?? doc.type),
    from: normalizeDeliveryType(doc.deliveryType),
    to,
  });

  if (!converted.ok) {
    if (isMissingAssetError(converted.error)) return "missing" as const;
    return { title: mediaTitle(doc), error: converted.error, to };
  }

  await db
    .collection("media")
    .updateOne({ _id: doc._id, publicId }, { $set: { deliveryType: to, secureUrl: converted.secureUrl } });
  return "converted" as const;
}

export async function syncMediaDelivery(db: Db, mediaIds: string[]): Promise<DeliverySyncResult> {
  const result: DeliverySyncResult = { converted: 0, missing: 0, failures: [] };
  const objectIds = toObjectIds(mediaIds);
  if (objectIds.length === 0) return result;

  const docs = await db
    .collection("media")
    .find(
      { _id: { $in: objectIds } },
      { projection: { title: 1, publicId: 1, resourceType: 1, type: 1, deliveryType: 1, isPublic: 1 } }
    )
    .toArray();
  const inGallery = await privateGalleryMediaIds(db, docs.map((doc) => String(doc._id)));

  const pending = docs.flatMap((doc) => {
    const publicId = typeof doc.publicId === "string" ? doc.publicId.trim() : "";
    const to = requiredDelivery(doc, inGallery.has(String(doc._id)));
    return publicId && to !== normalizeDeliveryType(doc.deliveryType) ? [{ doc, to }] : [];
  });

  const outcomes = await settleLimited(pending, CONVERSION_LIMIT, ({ doc, to }) => switchDelivery(db, doc, to));

  outcomes.forEach((outcome, index) => {
    const { doc, to } = pending[index]!;
    if (outcome.status === "rejected") {
      const error = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      result.failures.push({ title: mediaTitle(doc), error, to });
    } else if (outcome.value === "converted") result.converted += 1;
    else if (outcome.value === "missing") result.missing += 1;
    else result.failures.push(outcome.value);
  });

  return result;
}

export function deliveryFailureText(failures: DeliveryFailure[]): string | null {
  if (failures.length === 0) return null;
  const lines = failures.map((failure) =>
    failure.to === "authenticated"
      ? `“${failure.title}” is hidden, but its file could not be made private (${failure.error}).`
      : `“${failure.title}” could not be made public again (${failure.error}).`
  );
  return `${lines.join(" ")} Save again to retry.`;
}
