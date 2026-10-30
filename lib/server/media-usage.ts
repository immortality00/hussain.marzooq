import { ObjectId, type Db } from "mongodb";
import { findAssetUsagesByPublicId } from "@/lib/server/asset-references";
import { waitingDraftIdsByMedia } from "@/lib/server/waiting-drafts";
import { editedValue, type UsageEdit } from "@/lib/asset-usage-edits";
import { publicIdPattern, type AssetUsage } from "@/lib/asset-usage-locations";
import type { MediaInUse } from "@/lib/media-in-use";

export type MediaUsageConflict = MediaInUse & { publicId: string; usages: AssetUsage[] };

function mediaTitle(doc: Record<string, unknown>) {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  return title || "Untitled";
}

function filePublicId(doc: Record<string, unknown>) {
  return typeof doc.publicId === "string" ? doc.publicId.trim() : "";
}

/**
 * `ignoreWaitingDrafts`: the items are being deleted or made private, and a blog draft still
 * waiting on one of them goes with it (lib/server/waiting-drafts.ts), so it is not asked about.
 */
export async function findMediaUsageConflicts(
  db: Db,
  docs: Record<string, unknown>[],
  { ignoreWaitingDrafts = false }: { ignoreWaitingDrafts?: boolean } = {}
): Promise<MediaUsageConflict[]> {
  const withFile = docs.filter((doc) => filePublicId(doc));
  const [usages, drafts] = await Promise.all([
    findAssetUsagesByPublicId(db, withFile.map(filePublicId)),
    ignoreWaitingDrafts
      ? waitingDraftIdsByMedia(db, withFile.map((doc) => String(doc._id)))
      : new Map<string, Set<string>>(),
  ]);

  return withFile.flatMap((doc) => {
    const publicId = filePublicId(doc);
    const ownDrafts = drafts.get(String(doc._id));
    const found = usages
      .get(publicId)
      ?.filter((usage) => !(ownDrafts && "id" in usage.key && ownDrafts.has(usage.key.id)));
    if (!found?.length) return [];
    return [
      {
        id: String(doc._id),
        title: mediaTitle(doc),
        usedOn: found.map((usage) => usage.label),
        publicId,
        usages: found,
      },
    ];
  });
}

async function editOne(db: Db, publicId: string, usage: AssetUsage, edit: UsageEdit) {
  const collection = db.collection(usage.collection);
  const target = "slug" in usage.key ? { slug: usage.key.slug } : { _id: new ObjectId(usage.key.id) };
  const guardPath = usage.kind === "image" ? `${usage.path}.url` : usage.path;
  const guard: Record<string, unknown> = { ...target, [guardPath]: publicIdPattern(publicId) };

  let current: unknown;
  if (usage.kind === "markdown") {
    const doc = await collection.findOne(guard, { projection: { [usage.path]: 1 } });
    if (!doc) return;
    current = doc[usage.path];
    guard[usage.path] = current;
  }

  const value = editedValue(usage.kind, current, publicId, edit);
  // An image slot keeps its other fields (a hero photo's framing), so a photo that
  // moved category stays framed the same way.
  const set =
    usage.kind === "image" && value && typeof value === "object"
      ? Object.fromEntries(Object.entries(value).map(([key, field]) => [`${usage.path}.${key}`, field]))
      : { [usage.path]: value };

  await collection.updateOne(guard, { $set: { ...set, updatedAt: new Date() } });
}

export async function applyUsageEdit(
  db: Db,
  publicId: string,
  usages: AssetUsage[],
  edit: UsageEdit
): Promise<string[]> {
  const results = await Promise.allSettled(usages.map((usage) => editOne(db, publicId, usage, edit)));

  return usages.flatMap((usage, i) => {
    const result = results[i]!;
    if (result.status === "fulfilled") return [];
    console.error(`[media-usage] could not update ${usage.label}:`, result.reason);
    return [usage.label];
  });
}

export async function removeMediaUsages(db: Db, conflicts: MediaUsageConflict[]) {
  const failed: string[] = [];
  for (const conflict of conflicts) {
    failed.push(...(await applyUsageEdit(db, conflict.publicId, conflict.usages, { type: "remove" })));
  }
  return failed;
}
