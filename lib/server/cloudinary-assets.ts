import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";

export type CloudinaryResourceType = "image" | "video" | "raw";

type ParsedCloudinaryAsset = {
  publicId: string;
  resourceType: CloudinaryResourceType;
};

function normalizeAllowedFolders(allowedFolders: readonly string[]) {
  return allowedFolders
    .map((value) => value.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
}

function normalizeFolderPath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function encodeCloudinaryFolderPath(folder: string) {
  return normalizeFolderPath(folder)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isAllowedCloudinaryPublicId(
  publicId: string,
  allowedFolders: readonly string[]
): boolean {
  const normalizedPublicId = publicId.trim().replace(/^\/+/, "");
  if (!normalizedPublicId) return false;

  const folders = normalizeAllowedFolders(allowedFolders);

  return folders.some(
    (folder) => normalizedPublicId === folder || normalizedPublicId.startsWith(`${folder}/`)
  );
}

function isAllowedCloudinaryFolder(folder: string, allowedFolders: readonly string[]): boolean {
  const normalizedFolder = normalizeFolderPath(folder);
  if (!normalizedFolder) return false;

  const folders = normalizeAllowedFolders(allowedFolders);

  return folders.some(
    (baseFolder) => normalizedFolder === baseFolder || normalizedFolder.startsWith(`${baseFolder}/`)
  );
}

export function parseCloudinaryAssetFromUrl(url: string): ParsedCloudinaryAsset | null {
  const cloudName =
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();

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

    if (action !== "upload") return null;
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

export async function deleteManagedCloudinaryAsset(
  input: {
    url?: string | null;
    publicId?: string | null;
    resourceType?: string | null;
  },
  allowedFolders: readonly string[]
) {
  let publicId = (input.publicId ?? "").trim();
  let resourceType = (input.resourceType ?? "").trim() as CloudinaryResourceType | "";

  if (!publicId && input.url) {
    const parsed = parseCloudinaryAssetFromUrl(input.url);
    if (parsed) {
      publicId = parsed.publicId;
      resourceType = parsed.resourceType;
    }
  }

  if (!publicId) return false;
  if (!isAllowedCloudinaryPublicId(publicId, allowedFolders)) return false;

  const safeResourceType: CloudinaryResourceType =
    resourceType === "video" ? "video" : resourceType === "raw" ? "raw" : "image";

  if (!isCloudinaryConfigured()) return false;

  ensureCloudinaryConfigured();

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: safeResourceType,
      invalidate: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteManagedCloudinaryUrls(
  urls: string[],
  allowedFolders: readonly string[]
) {
  await Promise.all(
    urls
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      .map((url) => deleteManagedCloudinaryAsset({ url }, allowedFolders))
  );
}

export async function deleteManagedCloudinaryResourcesByPrefix(
  prefix: string,
  allowedFolders: readonly string[]
) {
  const normalizedPrefix = normalizeFolderPath(prefix);
  if (!normalizedPrefix) return false;
  if (!isAllowedCloudinaryPublicId(normalizedPrefix, allowedFolders)) return false;
  if (!isCloudinaryConfigured()) return false;

  ensureCloudinaryConfigured();

  try {
    await cloudinary.api.delete_resources_by_prefix(normalizedPrefix, {
      resource_type: "image",
      invalidate: true,
    });

    return true;
  } catch {
    return false;
  }
}

async function deleteFolderViaAdminApi(folder: string) {
  const cloudName =
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim();

  if (!cloudName || !apiKey || !apiSecret) return false;

  const normalizedFolder = normalizeFolderPath(folder);
  if (!normalizedFolder) return false;

  const encodedFolderPath = encodeCloudinaryFolderPath(normalizedFolder);
  if (!encodedFolderPath) return false;

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/folders/${encodedFolderPath}`
  );
  url.searchParams.set("skip_backup", "true");

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteManagedEmptyCloudinaryFolders(
  folders: string[],
  allowedFolders: readonly string[]
) {
  if (!isCloudinaryConfigured()) return;

  ensureCloudinaryConfigured();

  const normalized = [...new Set(folders.map(normalizeFolderPath).filter(Boolean))];
  const safeFolders = normalized.filter((folder) => isAllowedCloudinaryFolder(folder, allowedFolders));

  const deepestFirst = safeFolders.sort((a, b) => b.split("/").length - a.split("/").length);

  for (const folder of deepestFirst) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const deleted = await deleteFolderViaAdminApi(folder);
      if (deleted) break;
      await sleep(500);
    }
  }
}