import type { Db, ObjectId } from "mongodb";
import { noStoreJson } from "@/app/api/_lib/common";
import { deleteVideoPoster, discardUnsavedPoster } from "@/lib/server/video-posters";
import { findAssetUsages } from "@/lib/server/asset-references";
import type { StoredMediaAsset } from "@/lib/server/media-asset-management";
import { restoreMovedAsset, type AssetChange } from "./media-asset-change";
import type { MediaSet } from "./media-set";

async function undoAssetChange(db: Db, change: AssetChange, oldAsset: StoredMediaAsset) {
  await restoreMovedAsset(change.movedAssetOnCloudinary, oldAsset);
  await discardUnsavedPoster(db, change.newPoster?.publicId);
}

export async function writeMediaChange(
  db: Db,
  oid: ObjectId,
  set: MediaSet,
  change: AssetChange,
  oldAsset: StoredMediaAsset,
  oldPosterId: unknown
): Promise<Response | null> {
  let matchedCount = 0;
  try {
    const result = await db.collection("media").updateOne({ _id: oid }, { $set: set });
    matchedCount = result.matchedCount;
  } catch (error) {
    await undoAssetChange(db, change, oldAsset);
    throw error;
  }

  if (!matchedCount) {
    await undoAssetChange(db, change, oldAsset);
    return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });
  }

  if ("posterPublicId" in set && set.posterPublicId !== oldPosterId) {
    await deletePosterUnlessShown(db, oldPosterId);
  }

  return null;
}

/** A video link's thumbnail can be a blog post's cover (U7): it stays while a page shows it. */
export async function deletePosterUnlessShown(db: Db, posterPublicId: unknown) {
  if (typeof posterPublicId !== "string" || !posterPublicId) return;
  if ((await findAssetUsages(db, posterPublicId)).length > 0) return;
  await deleteVideoPoster(posterPublicId);
}
