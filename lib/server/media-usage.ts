import { ObjectId, type Db } from "mongodb";
import { findAssetUsagesByPublicId } from "@/lib/server/asset-references";
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

export async function findMediaUsageConflicts(
  db: Db,
  docs: Record<string, unknown>[]
): Promise<MediaUsageConflict[]> {
  const withFile = docs.filter((doc) => filePublicId(doc));
  const usages = await findAssetUsagesByPublicId(db, withFile.map(filePublicId));

  return withFile.flatMap((doc) => {
    const publicId = filePublicId(doc);
    const found = usages.get(publicId);
    if (!found) return [];
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

  await collection.updateOne(guard, {
    $set: { [usage.path]: editedValue(usage.kind, current, publicId, edit), updatedAt: new Date() },
  });
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
