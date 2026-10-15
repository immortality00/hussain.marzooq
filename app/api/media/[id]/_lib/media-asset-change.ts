import type { Db } from "mongodb";
import { noStoreJson } from "@/app/api/_lib/common";
import { storeVideoPoster, type VideoPoster } from "@/lib/server/video-posters";
import { videoEmbedSrc, type VideoRef } from "@/lib/video-embed";
import {
  assetIsInsideFolder,
  folderOfPublicId,
  moveStoredMediaAssetToFolder,
  normalizeUploadedMediaAsset,
  type StoredMediaAsset,
} from "@/lib/server/media-asset-management";
import { cloudinaryErrorMessage } from "@/lib/server/cloudinary-assets";
import type { MediaPatchInput } from "./parse-media-patch";
import type { MediaSet } from "./media-set";

export type AssetChange = {
  replacementAsset: StoredMediaAsset | null;
  movedAssetOnCloudinary: StoredMediaAsset | null;
  newPoster: VideoPoster | null;
  posterMissing: boolean;
};

function badRequest(error: string) {
  return noStoreJson({ ok: false, error }, { status: 400 });
}

async function moveToCategoryFolder(asset: StoredMediaAsset, folder: string) {
  const failure = "Could not move the media file to the selected category folder";
  try {
    const moved = await moveStoredMediaAssetToFolder(asset, folder);
    return moved ? { moved } : { failed: noStoreJson({ ok: false, error: `${failure}.` }, { status: 502 }) };
  } catch (error) {
    console.error("[media] move failed", error);
    const reason = cloudinaryErrorMessage(error);
    return { failed: noStoreJson({ ok: false, error: `${failure}: ${reason}` }, { status: 502 }) };
  }
}

export async function restoreMovedAsset(moved: StoredMediaAsset | null, original: StoredMediaAsset) {
  if (!moved || !original.publicId) return;
  await moveStoredMediaAssetToFolder(moved, folderOfPublicId(original.publicId));
}

function setAsset(set: MediaSet, asset: { secureUrl: string; publicId: string; resourceType: string }, type: string) {
  set.secureUrl = asset.secureUrl;
  set.publicId = asset.publicId;
  set.resourceType = asset.resourceType;
  set.type = type;
  set.embedUrl = null;
}

async function moveOldAsset(set: MediaSet, oldAsset: StoredMediaAsset, folder: string, change: AssetChange) {
  const move = await moveToCategoryFolder(oldAsset, folder);
  if (move.failed) return move.failed;
  const { moved } = move;

  setAsset(set, moved, moved.resourceType);
  change.replacementAsset = {
    secureUrl: moved.secureUrl,
    publicId: moved.publicId,
    resourceType: moved.resourceType,
    deliveryType: oldAsset.deliveryType,
  };
  change.movedAssetOnCloudinary = change.replacementAsset;
  return null;
}

async function setVideo(db: Db, set: MediaSet, existingMedia: Record<string, unknown>, video: VideoRef, change: AssetChange) {
  const embedSrc = videoEmbedSrc(video);
  set.type = "embed";
  set.embedUrl = embedSrc;
  set.secureUrl = null;
  set.publicId = null;
  set.resourceType = null;

  const keepsPoster =
    existingMedia.embedUrl === embedSrc &&
    typeof existingMedia.posterUrl === "string" &&
    typeof existingMedia.posterPublicId === "string";

  if (!keepsPoster) {
    change.newPoster = await storeVideoPoster(db, video);
    change.posterMissing = !change.newPoster;
    set.posterUrl = change.newPoster?.url ?? null;
    set.posterPublicId = change.newPoster?.publicId ?? null;
  }
}

async function setUploadedAsset(
  set: MediaSet,
  input: MediaPatchInput,
  incoming: NonNullable<MediaPatchInput["incomingAsset"]>,
  oldAsset: StoredMediaAsset,
  change: AssetChange
) {
  const normalized = normalizeUploadedMediaAsset({
    ...incoming,
    targetFolder: input.targetFolder,
    allowExistingManagedMediaAsset: true,
  });
  if (!normalized.ok) return badRequest(normalized.error);

  const { asset } = normalized;
  if (input.isShowreel && asset.type !== "video") return badRequest("Showreel uploads must be video files.");

  const isExistingAsset = Boolean(oldAsset.publicId && asset.publicId === oldAsset.publicId);
  if (isExistingAsset && !asset.isAlreadyInTargetFolder) {
    return moveOldAsset(set, oldAsset, input.targetFolder, change);
  }
  if (!asset.isAlreadyInTargetFolder) {
    return badRequest("Uploaded media URL is outside the selected media category folder.");
  }

  setAsset(set, asset, asset.type);
  change.replacementAsset = { secureUrl: asset.secureUrl, publicId: asset.publicId, resourceType: asset.resourceType };
  return null;
}

export async function applyAssetChange(
  db: Db,
  set: MediaSet,
  existingMedia: Record<string, unknown>,
  oldAsset: StoredMediaAsset,
  input: MediaPatchInput
): Promise<AssetChange | Response> {
  const change: AssetChange = {
    replacementAsset: null,
    movedAssetOnCloudinary: null,
    newPoster: null,
    posterMissing: false,
  };

  if (input.video) await setVideo(db, set, existingMedia, input.video, change);

  if (
    input.isShowreel &&
    !input.isEmbed &&
    !input.incomingAsset &&
    oldAsset.publicId &&
    oldAsset.resourceType !== "video"
  ) {
    return badRequest("Showreel uploads must be video files.");
  }

  const failed = input.incomingAsset
    ? await setUploadedAsset(set, input, input.incomingAsset, oldAsset, change)
    : !input.isEmbed && oldAsset.publicId && !assetIsInsideFolder(oldAsset.publicId, input.targetFolder)
      ? await moveOldAsset(set, oldAsset, input.targetFolder, change)
      : null;
  if (failed) return failed;

  if (set.embedUrl === null) {
    set.posterUrl = null;
    set.posterPublicId = null;
  }

  return change;
}
