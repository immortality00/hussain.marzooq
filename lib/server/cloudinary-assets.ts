import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import {
  cloudinaryErrorMessage,
  isAllowedCloudinaryPublicId,
  parseCloudinaryAssetFromUrl,
  type CloudinaryCleanupResult,
  type CloudinaryResourceType,
} from "@/lib/server/cloudinary-asset-urls";

export {
  cloudinaryErrorMessage,
  isAllowedCloudinaryPublicId,
  isAllowedCloudinaryUrl,
  parseCloudinaryAssetFromUrl,
  type CloudinaryResourceType,
} from "@/lib/server/cloudinary-asset-urls";
export {
  deleteManagedCloudinaryFolderTree,
  deleteManagedCloudinaryResourcesByPrefix,
} from "@/lib/server/cloudinary-folders";

type CloudinaryAssetRef = {
  url?: string | null;
  publicId?: string | null;
  resourceType?: string | null;
  deliveryType?: string | null;
};

// Overloads: strict=false (default) returns boolean, strict=true returns CloudinaryCleanupResult
export async function deleteManagedCloudinaryAsset(
  input: CloudinaryAssetRef,
  allowedFolders: readonly string[],
  strict?: false
): Promise<boolean>;
export async function deleteManagedCloudinaryAsset(
  input: CloudinaryAssetRef,
  allowedFolders: readonly string[],
  strict: true
): Promise<CloudinaryCleanupResult>;
export async function deleteManagedCloudinaryAsset(
  input: CloudinaryAssetRef,
  allowedFolders: readonly string[],
  strict = false
): Promise<boolean | CloudinaryCleanupResult> {
  let publicId = (input.publicId ?? "").trim();
  let resourceType = (input.resourceType ?? "").trim() as CloudinaryResourceType | "";
  let deliveryType = input.deliveryType === "authenticated" ? "authenticated" : "upload";

  if (!publicId && input.url) {
    const parsed = parseCloudinaryAssetFromUrl(input.url);
    if (parsed) {
      publicId = parsed.publicId;
      resourceType = parsed.resourceType;
      deliveryType = parsed.deliveryType;
    }
  }

  const target = publicId || input.url || "unknown";

  if (!publicId) {
    if (!strict) return false;
    return { ok: false, target, action: "delete-asset", error: "Missing Cloudinary public ID." };
  }

  if (!isAllowedCloudinaryPublicId(publicId, allowedFolders)) {
    if (!strict) return false;
    return { ok: false, target, action: "delete-asset", error: "Cloudinary public ID is outside the allowed folders." };
  }

  if (!isCloudinaryConfigured()) {
    if (!strict) return false;
    return { ok: false, target, action: "delete-asset", error: "Cloudinary config missing." };
  }

  const safeResourceType: CloudinaryResourceType =
    resourceType === "video" ? "video" : resourceType === "raw" ? "raw" : "image";

  ensureCloudinaryConfigured();

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: safeResourceType,
      type: deliveryType,
      invalidate: true,
    });
    if (!strict) return true;
    return { ok: true, target: publicId, action: "delete-asset" };
  } catch (error) {
    if (!strict) return false;
    return { ok: false, target: publicId, action: "delete-asset", error: cloudinaryErrorMessage(error) };
  }
}
