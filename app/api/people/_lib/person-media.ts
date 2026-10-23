import { ObjectId, type Db } from "mongodb";
import { resolvePageUsageBeforeLock } from "@/app/api/_lib/media-usage";
import { deliveryFailureText, privateGalleryMediaIds, syncMediaDelivery } from "@/lib/server/media-delivery";

export function personMediaFilter(personId: string, names: string[]) {
  const named = Array.from(new Set(names.filter(Boolean))).map((name) => ({ people: name }));
  return { $or: [{ peopleIds: personId }, ...named] };
}

// Gating hides every linked item, so each file not yet private is about to lose its
// public address — ask before a page that uses one breaks.
export function checkPersonMediaPageUsage(db: Db, personId: string, names: string[], clearPageUsages: boolean) {
  return resolvePageUsageBeforeLock(db, personMediaFilter(personId, names), clearPageUsages);
}

export async function hidePersonMedia(db: Db, personId: string, name: string, now: Date) {
  await db.collection("media").updateMany(
    { ...personMediaFilter(personId, [name]), isPublic: true },
    { $set: { isPublic: false, updatedAt: now }, $addToSet: { removalHiddenBy: personId } }
  );
}

async function gatedPersonAmong(db: Db, personIds: string[]) {
  const objectIds = personIds.filter((pid) => ObjectId.isValid(pid)).map((pid) => new ObjectId(pid));
  if (objectIds.length === 0) return false;
  const gated = await db.collection("people_profiles").findOne({
    _id: { $in: objectIds },
    $or: [{ isPublic: false }, { isPrivate: true }],
  });
  return Boolean(gated);
}

export async function republishPersonMedia(db: Db, personId: string, name: string, now: Date) {
  const media = db.collection("media");
  const linked = await media
    .find({ ...personMediaFilter(personId, [name]), isPublic: false })
    .project({ _id: 1, peopleIds: 1 })
    .toArray();
  // Private Gallery membership is a separate privacy system — never republish media
  // that's still in a gallery, no matter what this person's own gate is doing.
  const inGallery = await privateGalleryMediaIds(db, linked.map((doc) => String(doc._id)));

  for (const doc of linked) {
    if (inGallery.has(String(doc._id))) continue;

    const otherIds = (Array.isArray(doc.peopleIds) ? doc.peopleIds : []).filter(
      (pid): pid is string => typeof pid === "string" && pid !== personId
    );
    if (await gatedPersonAmong(db, otherIds)) continue;

    await media.updateOne(
      { _id: doc._id },
      { $set: { isPublic: true, updatedAt: now }, $unset: { removalHiddenBy: "" } }
    );
  }
}

// Brings every linked file in line with the delivery rule; returns a message when some
// could not be switched.
export async function syncPersonMediaDelivery(db: Db, personId: string, name: string) {
  const linked = await db
    .collection("media")
    .find(personMediaFilter(personId, [name]))
    .project({ _id: 1 })
    .toArray();
  const { failures } = await syncMediaDelivery(db, linked.map((doc) => String(doc._id)));
  return deliveryFailureText(failures);
}
