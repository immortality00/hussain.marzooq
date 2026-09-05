import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import { cloudinaryErrorMessage } from "@/lib/server/cloudinary-assets";

export type CloudinaryDeliveryType = "upload" | "authenticated";
export type CloudinaryAssetResourceType = "image" | "video";

export const GALLERY_DOWNLOAD_URL_TTL_SECONDS = 300;

export function normalizeDeliveryType(value: unknown): CloudinaryDeliveryType {
  return value === "authenticated" ? "authenticated" : "upload";
}

export function normalizeAssetResourceType(value: unknown): CloudinaryAssetResourceType {
  return value === "video" ? "video" : "image";
}

export function cloudinaryFormatFromUrl(url: string | null | undefined) {
  const raw = (url ?? "").trim();
  if (!raw) return "";

  const withoutQuery = raw.split(/[?#]/)[0];
  const lastSegment = withoutQuery.split("/").pop() ?? "";
  const match = lastSegment.match(/\.([a-z0-9]{2,5})$/i);

  return match ? match[1].toLowerCase() : "";
}

export function signedDeliveryUrl(params: {
  publicId: string;
  resourceType: CloudinaryAssetResourceType;
  deliveryType: CloudinaryDeliveryType;
  width?: number | null;
}) {
  ensureCloudinaryConfigured();

  const transformation =
    params.resourceType === "image" && params.width
      ? { width: params.width, crop: "limit", quality: "auto", fetch_format: "auto" }
      : {};

  return cloudinary.url(params.publicId, {
    resource_type: params.resourceType,
    type: params.deliveryType,
    sign_url: params.deliveryType === "authenticated",
    secure: true,
    ...transformation,
  });
}

export function expiringDownloadUrl(params: {
  publicId: string;
  format: string;
  resourceType: CloudinaryAssetResourceType;
  deliveryType: CloudinaryDeliveryType;
  ttlSeconds?: number;
}) {
  ensureCloudinaryConfigured();

  const ttlSeconds = params.ttlSeconds ?? GALLERY_DOWNLOAD_URL_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  const url = cloudinary.utils.private_download_url(params.publicId, params.format, {
    resource_type: params.resourceType,
    type: params.deliveryType,
    expires_at: expiresAt,
    attachment: true,
  });

  return { url, expiresAt };
}

export function fullyQualifiedPublicId(params: {
  publicId: string;
  resourceType: CloudinaryAssetResourceType;
  deliveryType: CloudinaryDeliveryType;
}) {
  return `${params.resourceType}/${params.deliveryType}/${params.publicId}`;
}

export function expiringArchiveUrl(params: {
  fullyQualifiedPublicIds: string[];
  targetPublicId: string;
  ttlSeconds?: number;
}) {
  ensureCloudinaryConfigured();

  const ttlSeconds = params.ttlSeconds ?? GALLERY_DOWNLOAD_URL_TTL_SECONDS;

  return cloudinary.utils.download_zip_url({
    resource_type: "auto",
    fully_qualified_public_ids: params.fullyQualifiedPublicIds,
    flatten_folders: true,
    use_original_filename: true,
    target_public_id: params.targetPublicId,
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export async function convertAssetDeliveryType(params: {
  publicId: string;
  resourceType: CloudinaryAssetResourceType;
  from: CloudinaryDeliveryType;
  to: CloudinaryDeliveryType;
}): Promise<{ ok: true; secureUrl: string } | { ok: false; error: string }> {
  if (params.from === params.to) {
    return { ok: false, error: "Delivery type is already set." };
  }

  ensureCloudinaryConfigured();

  try {
    const result = (await cloudinary.uploader.rename(params.publicId, params.publicId, {
      resource_type: params.resourceType,
      type: params.from,
      to_type: params.to,
      overwrite: true,
      invalidate: true,
    })) as unknown;

    const record = result && typeof result === "object" ? (result as Record<string, unknown>) : {};
    const secureUrl = typeof record.secure_url === "string" ? record.secure_url : "";

    if (!secureUrl) return { ok: false, error: "Cloudinary returned no URL." };
    return { ok: true, secureUrl };
  } catch (error) {
    return { ok: false, error: cloudinaryErrorMessage(error) };
  }
}
