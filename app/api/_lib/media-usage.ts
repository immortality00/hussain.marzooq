import type { Db, Document, Filter } from "mongodb";
import { noStoreJson } from "@/app/api/_lib/common";
import { revalidateSitePages } from "@/app/api/_lib/revalidate";
import { normalizeDeliveryType } from "@/lib/server/cloudinary-private";
import { findMediaUsageConflicts, removeMediaUsages } from "@/lib/server/media-usage";
import { formatMediaInUseError, MEDIA_IN_USE, type MediaInUse } from "@/lib/media-in-use";

export function mediaInUseResponse(items: MediaInUse[], extra: Record<string, unknown> = {}) {
  const list = items.map(({ id, title, usedOn }) => ({ id, title, usedOn }));
  return noStoreJson(
    { ok: false, code: MEDIA_IN_USE, error: formatMediaInUseError(list), items: list, ...extra },
    { status: 409 }
  );
}

export function usageUpdateFailedResponse(labels: string[], outcome: string) {
  return noStoreJson(
    { ok: false, error: `Could not update: ${labels.join(", ")}. ${outcome}` },
    { status: 500 }
  );
}

// A file going private loses its public address, so a page using it would break: answer
// 409 first, or with clearPageUsages empty those places and carry on.
export async function resolvePageUsageBeforeLock(
  db: Db,
  filter: Filter<Document>,
  clearPageUsages: boolean
): Promise<Response | null> {
  const docs = await db
    .collection("media")
    .find(filter, { projection: { title: 1, publicId: 1, deliveryType: 1 } })
    .toArray();
  const goingPrivate = docs.filter((doc) => normalizeDeliveryType(doc.deliveryType) !== "authenticated");
  const conflicts = await findMediaUsageConflicts(db, goingPrivate);
  if (conflicts.length === 0) return null;
  if (!clearPageUsages) return mediaInUseResponse(conflicts);

  const failed = await removeMediaUsages(db, conflicts);
  revalidateSitePages();
  return failed.length ? usageUpdateFailedResponse(failed, "Nothing was saved.") : null;
}
