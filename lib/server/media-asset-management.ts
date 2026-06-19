import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_MEDIA_FOLDER,
  getCloudinaryMediaFolderForCategory,
} from "@/lib/cloudinary-folders";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import {
  deleteManagedCloudinaryAsset,
  isAllowedCloudinaryPublicId,
  isAllowedCloudinaryUrl,
  parseCloudinaryAssetFromUrl,
  type CloudinaryResourceType,
} from "@/lib/server/cloudinary-assets";

export type StoredMediaAsset = {
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
};

export type MovedCloudinaryAsset = {
  secureUrl: string;
  publicId: string;
  resourceType: Exclude<CloudinaryResourceType, "raw">;
};

export type NormalizedCloudinaryMediaAsset = {
  secureUrl: string;
  publicId: string;
  resourceType: Exclude<CloudinaryResourceType, "raw">;
  type: "image" | "video";
  isAlreadyInTargetFolder: boolean;
};

export function getStoredMediaAsset(doc: Record<string, unknown>): StoredMediaAsset {
  return {
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
  };
}

export function getPrimaryMediaFolder(categories: readonly string[]) {
  return getCloudinaryMediaFolderForCategory(categories[0]);
}

export function assetIsInsideFolder(publicId: string | null | undefined, folder: string) {
  const normalizedPublicId = (publicId ?? "").trim().replace(/^\/+/, "");
  return normalizedPublicId.startsWith(`${folder}/`);
}

export function assetsPointToSameCloudinaryFile(a: StoredMediaAsset, b: StoredMediaAsset) {
  return Boolean(a.publicId && b.publicId && a.publicId === b.publicId);
}

export async function deleteStoredMediaAsset(asset: StoredMediaAsset) {
  await deleteManagedCloudinaryAsset(asset, [CLOUDINARY_MEDIA_FOLDER]);
}

function getCloudinaryFileName(publicId: string) {
  const parts = publicId.split("/").filter(Boolean);
  return parts[parts.length - 1] || `media-${Date.now()}`;
}

function normalizeResourceType(value: string | null | undefined): Exclude<CloudinaryResourceType, "raw"> {
  return value === "video" ? "video" : "image";
}

export function normalizeUploadedMediaAsset(input: {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  targetFolder: string;
  allowExistingManagedMediaAsset?: boolean;
}): { ok: true; asset: NormalizedCloudinaryMediaAsset } | { ok: false; error: string } {
  const secureUrl = input.secureUrl.trim();
  const publicId = input.publicId.trim().replace(/^\/+/, "");
  const resourceType = input.resourceType.trim();
  const allowedFolders = input.allowExistingManagedMediaAsset
    ? [CLOUDINARY_MEDIA_FOLDER]
    : [input.targetFolder];

  if (!secureUrl || !publicId || !resourceType) {
    return { ok: false, error: "Uploaded media asset is incomplete." };
  }

  const parsed = parseCloudinaryAssetFromUrl(secureUrl);
  if (!parsed) {
    return { ok: false, error: "Use a valid Cloudinary media URL." };
  }

  if (parsed.resourceType === "raw") {
    return { ok: false, error: "Media uploads must be images or videos." };
  }

  if (parsed.publicId !== publicId) {
    return { ok: false, error: "Uploaded media URL does not match the media public ID." };
  }

  if (resourceType !== "auto" && resourceType !== parsed.resourceType) {
    return { ok: false, error: "Uploaded media resource type does not match the media URL." };
  }

  if (!isAllowedCloudinaryUrl(secureUrl, allowedFolders)) {
    return { ok: false, error: "Uploaded media URL is outside the managed media folder." };
  }

  if (!isAllowedCloudinaryPublicId(publicId, allowedFolders)) {
    return { ok: false, error: "Uploaded media public ID is outside the managed media folder." };
  }

  return {
    ok: true,
    asset: {
      secureUrl,
      publicId,
      resourceType: parsed.resourceType,
      type: parsed.resourceType,
      isAlreadyInTargetFolder: assetIsInsideFolder(publicId, input.targetFolder),
    },
  };
}

export async function moveStoredMediaAssetToFolder(
  asset: StoredMediaAsset,
  targetFolder: string
): Promise<MovedCloudinaryAsset | null> {
  const publicId = (asset.publicId ?? "").trim().replace(/^\/+/, "");
  if (!publicId) return null;

  if (!isAllowedCloudinaryPublicId(publicId, [CLOUDINARY_MEDIA_FOLDER])) return null;

  const resourceType = normalizeResourceType(asset.resourceType);
  const fileName = getCloudinaryFileName(publicId);
  const destinationPublicId = `${targetFolder}/${fileName}`;

  if (destinationPublicId === publicId) {
    const parsed = asset.secureUrl ? parseCloudinaryAssetFromUrl(asset.secureUrl) : null;

    return {
      secureUrl: asset.secureUrl ?? "",
      publicId,
      resourceType: parsed?.resourceType === "video" ? "video" : resourceType,
    };
  }

  ensureCloudinaryConfigured();

  const renameResult = (await cloudinary.uploader.rename(publicId, destinationPublicId, {
    resource_type: resourceType,
    invalidate: true,
    overwrite: false,
  })) as unknown;

  if (!renameResult || typeof renameResult !== "object") return null;

  const result = renameResult as Record<string, unknown>;
  const movedSecureUrl = typeof result.secure_url === "string" ? result.secure_url : "";
  const movedPublicId = typeof result.public_id === "string" ? result.public_id : destinationPublicId;
  const movedResourceType =
    result.resource_type === "video" || result.resource_type === "image"
      ? result.resource_type
      : resourceType;

  if (!movedSecureUrl || !movedPublicId) return null;

  return {
    secureUrl: movedSecureUrl,
    publicId: movedPublicId,
    resourceType: movedResourceType,
  };
}