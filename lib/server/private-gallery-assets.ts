import { ObjectId, type Db } from "mongodb";
import { syncMediaDelivery, type DeliveryFailure } from "@/lib/server/media-delivery";

export type GalleryPrivacyResult = {
  hidden: number;
  converted: number;
  missing: number;
  failures: DeliveryFailure[];
};

function toObjectIds(mediaIds: string[]) {
  return mediaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
}

export async function makeMediaPrivateForGallery(
  db: Db,
  mediaIds: string[]
): Promise<GalleryPrivacyResult> {
  const objectIds = toObjectIds(mediaIds);
  if (objectIds.length === 0) return { hidden: 0, converted: 0, missing: 0, failures: [] };

  const hidden = await db
    .collection("media")
    .updateMany({ _id: { $in: objectIds } }, { $set: { isPublic: false } });

  const synced = await syncMediaDelivery(db, mediaIds);
  return { hidden: hidden.matchedCount, ...synced };
}

// Leaving a gallery does not make an item public — it stays hidden, so its file stays
// private until the item itself is made Public.
export async function releaseMediaFromPrivateGalleries(db: Db, mediaIds: string[]) {
  if (mediaIds.length === 0) return;

  const { failures } = await syncMediaDelivery(db, mediaIds);
  for (const failure of failures) {
    console.error(`[media-delivery] "${failure.title}" was not switched to ${failure.to}: ${failure.error}`);
  }
}

export function formatGalleryConversionError(failures: DeliveryFailure[]) {
  const details = failures.map((f) => `${f.title} (${f.error})`).join("; ");
  return `These items are now hidden from the public site, but their files could not be switched to private delivery: ${details}. The gallery was not saved — fix those items and save again.`;
}
