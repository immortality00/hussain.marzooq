import { v2 as cloudinary } from "cloudinary";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { toAdminTestimonialItem } from "@/lib/server/testimonial-serializers";
import {
  asBooleanOrNull,
  asNumberOrNull,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { parseCloudinaryAssetFromUrl } from "@/lib/server/cloudinary-assets";

export const dynamic = "force-dynamic";

type CleanupResult = {
  ok: boolean;
  target: string;
  error?: string;
};

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

function isSafeTestimonialChildFolder(folder: string) {
  const normalized = normalizeFolderPath(folder);

  return (
    normalized.length > 0 &&
    normalized !== CLOUDINARY_TESTIMONIALS_FOLDER &&
    normalized.startsWith(`${CLOUDINARY_TESTIMONIALS_FOLDER}/`)
  );
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function collectTestimonialFolders(doc: Record<string, unknown>) {
  const reviewAssetFolder =
    typeof doc.reviewAssetFolder === "string" ? normalizeFolderPath(doc.reviewAssetFolder) : "";
  const reviewProfileFolder =
    typeof doc.reviewProfileFolder === "string" ? normalizeFolderPath(doc.reviewProfileFolder) : "";
  const reviewPhotosFolder =
    typeof doc.reviewPhotosFolder === "string" ? normalizeFolderPath(doc.reviewPhotosFolder) : "";

  return Array.from(
    new Set(
      [reviewProfileFolder, reviewPhotosFolder, reviewAssetFolder].filter(
        isSafeTestimonialChildFolder
      )
    )
  );
}

function collectTestimonialAssetUrls(doc: Record<string, unknown>) {
  const profilePhotoUrl = typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : "";
  const photoUrls = getStringArray(doc.photoUrls);

  return [profilePhotoUrl, ...photoUrls].filter(Boolean);
}

function getPublicIdsFromUrls(urls: string[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => parseCloudinaryAssetFromUrl(url))
        .filter((asset): asset is NonNullable<ReturnType<typeof parseCloudinaryAssetFromUrl>> =>
          Boolean(asset)
        )
        .map((asset) => asset.publicId)
        .filter((publicId) => publicId.startsWith(`${CLOUDINARY_TESTIMONIALS_FOLDER}/`))
    )
  );
}

function getCloudinaryAdminConfig() {
  const cloudName =
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();

  const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim();

  return { cloudName, apiKey, apiSecret };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown Cloudinary error.";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deleteAssetsByPrefix(folder: string): Promise<CleanupResult> {
  const normalizedFolder = normalizeFolderPath(folder);

  if (!isSafeTestimonialChildFolder(normalizedFolder)) {
    return { ok: true, target: normalizedFolder || folder };
  }

  if (!isCloudinaryConfigured()) {
    return { ok: false, target: normalizedFolder, error: "Cloudinary config missing." };
  }

  ensureCloudinaryConfigured();

  try {
    await cloudinary.api.delete_resources_by_prefix(normalizedFolder, {
      resource_type: "image",
      invalidate: true,
    });

    return { ok: true, target: normalizedFolder };
  } catch (error) {
    return {
      ok: false,
      target: normalizedFolder,
      error: getErrorMessage(error),
    };
  }
}

async function deleteAssetsByPublicIds(publicIds: string[]): Promise<CleanupResult> {
  const safePublicIds = Array.from(
    new Set(
      publicIds
        .map((publicId) => publicId.trim().replace(/^\/+/, ""))
        .filter((publicId) => publicId.startsWith(`${CLOUDINARY_TESTIMONIALS_FOLDER}/`))
    )
  );

  if (safePublicIds.length === 0) {
    return { ok: true, target: "testimonial assets" };
  }

  if (!isCloudinaryConfigured()) {
    return { ok: false, target: "testimonial assets", error: "Cloudinary config missing." };
  }

  ensureCloudinaryConfigured();

  try {
    for (let index = 0; index < safePublicIds.length; index += 100) {
      const batch = safePublicIds.slice(index, index + 100);

      await cloudinary.api.delete_resources(batch, {
        resource_type: "image",
        type: "upload",
        invalidate: true,
      });
    }

    return { ok: true, target: "testimonial assets" };
  } catch (error) {
    return {
      ok: false,
      target: "testimonial assets",
      error: getErrorMessage(error),
    };
  }
}

async function deleteEmptyFolder(folder: string): Promise<CleanupResult> {
  const normalizedFolder = normalizeFolderPath(folder);

  if (!isSafeTestimonialChildFolder(normalizedFolder)) {
    return { ok: true, target: normalizedFolder || folder };
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryAdminConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, target: normalizedFolder, error: "Cloudinary config missing." };
  }

  const encodedFolderPath = encodeCloudinaryFolderPath(normalizedFolder);

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

    if (response.ok || response.status === 404) {
      return { ok: true, target: normalizedFolder };
    }

    const responseText = await response.text().catch(() => "");

    return {
      ok: false,
      target: normalizedFolder,
      error: `Cloudinary folder delete failed with ${response.status}${
        responseText ? `: ${responseText}` : ""
      }`,
    };
  } catch (error) {
    return {
      ok: false,
      target: normalizedFolder,
      error: getErrorMessage(error),
    };
  }
}

async function cleanupTestimonialCloudinary(doc: Record<string, unknown>) {
  const folders = collectTestimonialFolders(doc);
  const assetUrls = collectTestimonialAssetUrls(doc);
  const publicIds = getPublicIdsFromUrls(assetUrls);

  for (const folder of folders) {
    const result = await deleteAssetsByPrefix(folder);
    if (!result.ok) {
      throw new Error(`Cloudinary asset cleanup failed for ${result.target}: ${result.error}`);
    }
  }

  const publicIdResult = await deleteAssetsByPublicIds(publicIds);
  if (!publicIdResult.ok) {
    throw new Error(
      `Cloudinary asset cleanup failed for ${publicIdResult.target}: ${publicIdResult.error}`
    );
  }

  await sleep(800);

  const deepestFirst = [...folders].sort((a, b) => b.split("/").length - a.split("/").length);

  for (const folder of deepestFirst) {
    let lastResult: CleanupResult | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      lastResult = await deleteEmptyFolder(folder);
      if (lastResult.ok) break;
      await sleep(500);
    }

    if (lastResult && !lastResult.ok) {
      throw new Error(`Cloudinary folder cleanup failed for ${lastResult.target}: ${lastResult.error}`);
    }
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db.collection("testimonials").findOne({ _id: oid });

  if (!doc) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({
    ok: true,
    item: toAdminTestimonialItem(doc as Record<string, unknown>),
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const isApproved = asBooleanOrNull(body.isApproved);
  const sortOrder = asNumberOrNull(body.sortOrder);

  if (isApproved === null && sortOrder === null) {
    return noStoreJson(
      {
        ok: false,
        error: "Only approval status and sort order can be changed for testimonials.",
      },
      { status: 400 }
    );
  }

  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (isApproved !== null) {
    set.isApproved = isApproved;
    set.approvedAt = isApproved ? new Date() : null;
  }

  if (sortOrder !== null) {
    if (!Number.isFinite(sortOrder)) {
      return noStoreJson({ ok: false, error: "Invalid sort order." }, { status: 400 });
    }

    set.sortOrder = Math.round(sortOrder);
  }

  const db = await getDb();

  const result = await db.collection("testimonials").updateOne({ _id: oid }, { $set: set });

  if (!result.matchedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db.collection("testimonials").findOne({ _id: oid });

  if (!doc) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  try {
    await cleanupTestimonialCloudinary(doc as Record<string, unknown>);
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Cloudinary cleanup failed.",
      },
      { status: 502 }
    );
  }

  const result = await db.collection("testimonials").deleteOne({ _id: oid });

  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true });
}