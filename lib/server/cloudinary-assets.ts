import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";

export type CloudinaryResourceType = "image" | "video" | "raw";

type ParsedCloudinaryAsset = {
  publicId: string;
  resourceType: CloudinaryResourceType;
  deliveryType: "upload" | "authenticated";
};

type CloudinaryAssetRef = {
  url?: string | null;
  publicId?: string | null;
  resourceType?: string | null;
  deliveryType?: string | null;
};

type CloudinaryCleanupResult = {
  ok: boolean;
  target: string;
  action: "delete-asset" | "delete-prefix" | "delete-folder";
  error?: string;
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

export async function deleteManagedCloudinaryUrlsStrict(
  urls: string[],
  allowedFolders: readonly string[]
) {
  const uniqueUrls = Array.from(
    new Set(urls.filter((url) => typeof url === "string" && url.trim().length > 0))
  );

  return Promise.all(
    uniqueUrls.map((url) => deleteManagedCloudinaryAsset({ url }, allowedFolders, true))
  );
}

export async function deleteManagedCloudinaryResourcesByPrefix(
  prefix: string,
  allowedFolders: readonly string[],
  strict = false
): Promise<boolean | CloudinaryCleanupResult> {
  const normalizedPrefix = normalizeFolderPath(prefix);

  if (!normalizedPrefix) {
    if (!strict) return false;
    return { ok: false, target: prefix, action: "delete-prefix", error: "Missing Cloudinary prefix." };
  }

  if (!isAllowedCloudinaryPublicId(normalizedPrefix, allowedFolders)) {
    if (!strict) return false;
    return { ok: false, target: normalizedPrefix, action: "delete-prefix", error: "Cloudinary prefix is outside the allowed folders." };
  }

  if (!isCloudinaryConfigured()) {
    if (!strict) return false;
    return { ok: false, target: normalizedPrefix, action: "delete-prefix", error: "Cloudinary config missing." };
  }

  ensureCloudinaryConfigured();

  try {
    await cloudinary.api.delete_resources_by_prefix(normalizedPrefix, {
      resource_type: "image",
      invalidate: true,
    });
    if (!strict) return true;
    return { ok: true, target: normalizedPrefix, action: "delete-prefix" };
  } catch (error) {
    if (!strict) return false;
    return { ok: false, target: normalizedPrefix, action: "delete-prefix", error: cloudinaryErrorMessage(error) };
  }
}

async function deleteFolderViaAdminApi(folder: string): Promise<CloudinaryCleanupResult> {
  const cloudName =
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim();

  const normalizedFolder = normalizeFolderPath(folder);

  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, target: normalizedFolder || folder, action: "delete-folder", error: "Cloudinary config missing." };
  }

  if (!normalizedFolder) {
    return { ok: false, target: folder, action: "delete-folder", error: "Missing Cloudinary folder." };
  }

  const encodedFolderPath = encodeCloudinaryFolderPath(normalizedFolder);

  if (!encodedFolderPath) {
    return { ok: false, target: normalizedFolder, action: "delete-folder", error: "Invalid Cloudinary folder path." };
  }

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/folders/${encodedFolderPath}`
  );

  url.searchParams.set("skip_backup", "true");

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });

    if (response.ok || response.status === 404) {
      return { ok: true, target: normalizedFolder, action: "delete-folder" };
    }

    const responseText = await response.text().catch(() => "");

    return {
      ok: false,
      target: normalizedFolder,
      action: "delete-folder",
      error: `Cloudinary folder delete failed with ${response.status}${responseText ? `: ${responseText}` : ""}`,
    };
  } catch (error) {
    return { ok: false, target: normalizedFolder, action: "delete-folder", error: cloudinaryErrorMessage(error) };
  }
}

export async function deleteManagedEmptyCloudinaryFolders(
  folders: string[],
  allowedFolders: readonly string[]
) {
  if (!isCloudinaryConfigured()) return;

  ensureCloudinaryConfigured();

  const normalized = Array.from(new Set(folders.map(normalizeFolderPath).filter(Boolean)));
  const safeFolders = normalized.filter((folder) => isAllowedCloudinaryFolder(folder, allowedFolders));
  const deepestFirst = safeFolders.sort((a, b) => b.split("/").length - a.split("/").length);

  for (const folder of deepestFirst) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await deleteFolderViaAdminApi(folder);
      if (result.ok) break;
      await sleep(500);
    }
  }
}

export async function deleteManagedEmptyCloudinaryFoldersStrict(
  folders: string[],
  allowedFolders: readonly string[]
) {
  if (!isCloudinaryConfigured()) {
    return [{ ok: false, target: "Cloudinary", action: "delete-folder" as const, error: "Cloudinary config missing." }];
  }

  ensureCloudinaryConfigured();

  const normalized = Array.from(new Set(folders.map(normalizeFolderPath).filter(Boolean)));
  const safeFolders = normalized.filter((folder) => isAllowedCloudinaryFolder(folder, allowedFolders));
  const deepestFirst = safeFolders.sort((a, b) => b.split("/").length - a.split("/").length);
  const results: CloudinaryCleanupResult[] = [];

  for (const folder of deepestFirst) {
    let finalResult: CloudinaryCleanupResult | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await deleteFolderViaAdminApi(folder);
      finalResult = result;
      if (result.ok) break;
      await sleep(500);
    }

    if (finalResult) results.push(finalResult);
  }

  return results;
}

export async function deleteManagedCloudinaryFolderTree(
  rootFolder: string,
  allowedFolders: readonly string[]
) {
  const normalizedRootFolder = normalizeFolderPath(rootFolder);

  if (!normalizedRootFolder) {
    return [{ ok: false, target: rootFolder, action: "delete-asset" as const, error: "Missing Cloudinary folder." }];
  }

  if (!isAllowedCloudinaryFolder(normalizedRootFolder, allowedFolders)) {
    return [{ ok: false, target: normalizedRootFolder, action: "delete-asset" as const, error: "Cloudinary folder is outside the allowed folders." }];
  }

  const cleanupResults: CloudinaryCleanupResult[] = [];

  const prefixResult = await deleteManagedCloudinaryResourcesByPrefix(normalizedRootFolder, allowedFolders, true) as CloudinaryCleanupResult;
  cleanupResults.push(prefixResult);

  const folderDeletionResults = await deleteManagedEmptyCloudinaryFoldersStrict(
    [`${normalizedRootFolder}/pfp`, `${normalizedRootFolder}/photos`, normalizedRootFolder],
    allowedFolders
  );
  cleanupResults.push(...folderDeletionResults);

  return cleanupResults;
}
