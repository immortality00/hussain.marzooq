import type { Db, ObjectId } from "mongodb";
import { noStoreJson } from "@/app/api/_lib/common";
import { deleteVideoPoster, discardUnsavedPoster } from "@/lib/server/video-posters";
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
    await deleteVideoPoster(oldPosterId);
  }

  return null;
}
