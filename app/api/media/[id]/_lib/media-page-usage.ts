import type { Db } from "mongodb";
import { mediaInUseResponse } from "@/app/api/_lib/media-usage";
import { noStoreJson } from "@/app/api/_lib/common";
import { findAssetUsages } from "@/lib/server/asset-references";
import {
  applyUsageEdit,
  findMediaUsageConflicts,
  type MediaUsageConflict,
} from "@/lib/server/media-usage";
import {
  assetIsInsideFolder,
  assetsPointToSameCloudinaryFile,
  deleteStoredMediaAsset,
  type StoredMediaAsset,
} from "@/lib/server/media-asset-management";
import type { UsageEdit } from "@/lib/asset-usage-edits";
import type { MediaPatchInput } from "./parse-media-patch";
import type { MediaSet } from "./media-set";
import type { AssetChange } from "./media-asset-change";

export type PageUsage = { replacesFile: boolean; hides: boolean; oldFileInUse: MediaUsageConflict | null };

// `hidden`: the item is hidden after this save, so a file not yet private is about to lose
// its public address (lib/server/media-delivery.ts) and a page using it would break.
export async function checkPageUsage(
  db: Db,
  existingMedia: Record<string, unknown>,
  oldAsset: StoredMediaAsset,
  input: MediaPatchInput,
  hidden: boolean
): Promise<PageUsage | Response> {
  const { video, incomingAsset, usageChoice } = input;
  const replacesFile =
    Boolean(oldAsset.publicId) &&
    (video !== null ||
      (incomingAsset !== null && incomingAsset.publicId.trim().replace(/^\/+/, "") !== oldAsset.publicId));
  const mayMoveFile =
    Boolean(oldAsset.publicId) && !assetIsInsideFolder(oldAsset.publicId, input.targetFolder);
  const hides = hidden && Boolean(oldAsset.publicId) && oldAsset.deliveryType !== "authenticated";
  const [oldFileInUse] =
    replacesFile || mayMoveFile || hides ? await findMediaUsageConflicts(db, [existingMedia]) : [];

  if ((replacesFile || hides) && oldFileInUse) {
    const canReplace = replacesFile && !hidden && !video && incomingAsset?.resourceType === "image";
    if (!usageChoice) {
      return mediaInUseResponse([oldFileInUse], { canReplace, ...(hides && !replacesFile ? { hides: true } : {}) });
    }
    if (usageChoice === "replace" && !canReplace) {
      const error = hidden ? "A hidden item can't be shown there." : "Only a photo can take its place there.";
      return noStoreJson({ ok: false, error }, { status: 400 });
    }
  }

  return { replacesFile, hides, oldFileInUse: oldFileInUse ?? null };
}

function pageEditFor(usage: PageUsage, input: MediaPatchInput, set: MediaSet, movedFile: StoredMediaAsset | null): UsageEdit | null {
  if (!usage.oldFileInUse) return null;
  if (usage.replacesFile) {
    return input.usageChoice === "replace" ? { type: "replace", url: String(set.secureUrl) } : { type: "remove" };
  }
  if (usage.hides) return { type: "remove" };
  return movedFile?.secureUrl ? { type: "replace", url: movedFile.secureUrl } : null;
}

export async function finishFileChange(
  db: Db,
  usage: PageUsage,
  input: MediaPatchInput,
  set: MediaSet,
  oldAsset: StoredMediaAsset,
  change: AssetChange
) {
  const moved = change.movedAssetOnCloudinary;
  const movedFile = moved && moved.publicId !== oldAsset.publicId ? moved : null;
  const pageEdit = pageEditFor(usage, input, set, movedFile);
  const pagesNotUpdated =
    usage.oldFileInUse && pageEdit
      ? await applyUsageEdit(db, usage.oldFileInUse.publicId, usage.oldFileInUse.usages, pageEdit)
      : [];

  if (oldAsset.publicId) {
    const replacedWithDifferentAsset =
      change.replacementAsset !== null && !assetsPointToSameCloudinaryFile(oldAsset, change.replacementAsset);
    const stillUsed = pageEdit ? await findAssetUsages(db, oldAsset.publicId) : [];

    if ((input.isEmbed || replacedWithDifferentAsset) && stillUsed.length === 0) {
      await deleteStoredMediaAsset(oldAsset);
    }
  }

  return { pageEdit, pagesNotUpdated };
}
