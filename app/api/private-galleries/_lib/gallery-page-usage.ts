import { ObjectId, type Db } from "mongodb";
import { resolvePageUsageBeforeLock } from "@/app/api/_lib/media-usage";

export async function resolveGalleryPageUsage(
  db: Db,
  mediaIds: string[],
  clearPageUsages: boolean
): Promise<Response | null> {
  const objectIds = mediaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (objectIds.length === 0) return null;
  return resolvePageUsageBeforeLock(db, { _id: { $in: objectIds } }, clearPageUsages);
}
