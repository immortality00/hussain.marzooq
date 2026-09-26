import { ObjectId, type Db } from "mongodb";
import { mediaInUseResponse, usageUpdateFailedResponse } from "@/app/api/_lib/media-usage";
import { revalidateSitePages } from "@/app/api/_lib/revalidate";
import { normalizeDeliveryType } from "@/lib/server/cloudinary-private";
import { findMediaUsageConflicts, removeMediaUsages } from "@/lib/server/media-usage";

export async function resolveGalleryPageUsage(
  db: Db,
  mediaIds: string[],
  clearPageUsages: boolean
): Promise<Response | null> {
  const objectIds = mediaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (objectIds.length === 0) return null;

  const docs = await db
    .collection("media")
    .find({ _id: { $in: objectIds } }, { projection: { title: 1, publicId: 1, deliveryType: 1 } })
    .toArray();
  const goingPrivate = docs.filter((doc) => normalizeDeliveryType(doc.deliveryType) !== "authenticated");
  const conflicts = await findMediaUsageConflicts(db, goingPrivate);
  if (conflicts.length === 0) return null;
  if (!clearPageUsages) return mediaInUseResponse(conflicts);

  const failed = await removeMediaUsages(db, conflicts);
  revalidateSitePages();
  return failed.length ? usageUpdateFailedResponse(failed, "Nothing was saved.") : null;
}
