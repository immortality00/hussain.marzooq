export type CloudinaryResourceType = "image" | "video" | "raw";

type ParsedCloudinaryAsset = {
  publicId: string;
  resourceType: CloudinaryResourceType;
  deliveryType: "upload" | "authenticated";
};

export type CloudinaryCleanupResult = {
  ok: boolean;
  target: string;
  action: "delete-asset" | "delete-prefix" | "delete-folder";
  error?: string;
};

export function cloudinaryCloudName() {
  return (
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim()
  );
}

export function normalizeFolderPath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function normalizeAllowedFolders(allowedFolders: readonly string[]) {
  return allowedFolders.map(normalizeFolderPath).filter(Boolean);
}

function isInsideAllowedFolders(path: string, allowedFolders: readonly string[]) {
  return normalizeAllowedFolders(allowedFolders).some(
    (folder) => path === folder || path.startsWith(`${folder}/`)
  );
}

export function cloudinaryErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const nested = record.error;
    const message =
      typeof record.message === "string"
        ? record.message
        : nested && typeof nested === "object" && typeof (nested as Record<string, unknown>).message === "string"
          ? ((nested as Record<string, unknown>).message as string)
          : "";

    if (message) return message;
  }

  return "Unknown Cloudinary error.";
}

export function isAllowedCloudinaryPublicId(
  publicId: string,
  allowedFolders: readonly string[]
): boolean {
  const normalizedPublicId = publicId.trim().replace(/^\/+/, "");
  if (!normalizedPublicId) return false;
  return isInsideAllowedFolders(normalizedPublicId, allowedFolders);
}

export function isAllowedCloudinaryFolder(folder: string, allowedFolders: readonly string[]): boolean {
  const normalizedFolder = normalizeFolderPath(folder);
  if (!normalizedFolder) return false;
  return isInsideAllowedFolders(normalizedFolder, allowedFolders);
}

export function parseCloudinaryAssetFromUrl(url: string): ParsedCloudinaryAsset | null {
  const cloudName = cloudinaryCloudName();
  if (!cloudName) return null;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") return null;
    if (parsedUrl.hostname !== "res.cloudinary.com") return null;

    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;
    if (parts[0] !== cloudName) return null;

    const resourceTypeRaw = parts[1];
    const action = parts[2];

    if (action !== "upload" && action !== "authenticated") return null;
    if (resourceTypeRaw !== "image" && resourceTypeRaw !== "video" && resourceTypeRaw !== "raw") {
      return null;
    }

    const afterUpload = parts.slice(3);
    if (afterUpload.length === 0) return null;

    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part));
    const publicIdParts = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (publicIdParts.length === 0) return null;

    const lastPart = publicIdParts[publicIdParts.length - 1];
    const lastPartWithoutExt =
      resourceTypeRaw === "raw" ? lastPart : lastPart.replace(/\.[^/.]+$/, "");

    const normalizedParts = [...publicIdParts.slice(0, -1), lastPartWithoutExt].filter(Boolean);
    if (normalizedParts.length === 0) return null;

    return {
      publicId: normalizedParts.join("/"),
      resourceType: resourceTypeRaw,
      deliveryType: action,
    };
  } catch {
    return null;
  }
}

export function isAllowedCloudinaryUrl(url: string, allowedFolders: readonly string[]) {
  const parsed = parseCloudinaryAssetFromUrl(url);
  if (!parsed) return false;
  return isAllowedCloudinaryPublicId(parsed.publicId, allowedFolders);
}
