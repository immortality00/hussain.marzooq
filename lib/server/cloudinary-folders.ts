import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import {
  cloudinaryCloudName,
  cloudinaryErrorMessage,
  isAllowedCloudinaryFolder,
  isAllowedCloudinaryPublicId,
  normalizeFolderPath,
  type CloudinaryCleanupResult,
  type CloudinaryResourceType,
} from "@/lib/server/cloudinary-asset-urls";

const PREFIX_RESOURCE_TYPES: readonly CloudinaryResourceType[] = ["image", "video", "raw"];

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
    for (const resourceType of PREFIX_RESOURCE_TYPES) {
      await cloudinary.api.delete_resources_by_prefix(normalizedPrefix, {
        resource_type: resourceType,
        invalidate: true,
      });
    }
    if (!strict) return true;
    return { ok: true, target: normalizedPrefix, action: "delete-prefix" };
  } catch (error) {
    if (!strict) return false;
    return { ok: false, target: normalizedPrefix, action: "delete-prefix", error: cloudinaryErrorMessage(error) };
  }
}

async function deleteFolderViaAdminApi(folder: string): Promise<CloudinaryCleanupResult> {
  const cloudName = cloudinaryCloudName();
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

async function deleteEmptyFolders(folders: string[], allowedFolders: readonly string[]) {
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

  const folderDeletionResults = await deleteEmptyFolders(
    [`${normalizedRootFolder}/pfp`, `${normalizedRootFolder}/photos`, normalizedRootFolder],
    allowedFolders
  );
  cleanupResults.push(...folderDeletionResults);

  return cleanupResults;
}
