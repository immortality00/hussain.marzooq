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
import {
  deleteManagedCloudinaryFolderTree,
  parseCloudinaryAssetFromUrl,
} from "@/lib/server/cloudinary-assets";

export const dynamic = "force-dynamic";

type CleanupResult = {
  ok: boolean;
  target: string;
  error?: string;
};

function normalizeFolderPath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) return error.map(getErrorMessage).join("; ");
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
    if (typeof err.error === "string") return err.error;
    if (err.error && typeof err.error === "object") {
      const nested = err.error as Record<string, unknown>;
      if (typeof nested.message === "string") return nested.message;
      if (typeof nested.error === "string") return nested.error;
      try {
        return JSON.stringify(err.error);
      } catch {
        return String(err.error);
      }
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown Cloudinary error.";
    }
  }
  return "Unknown Cloudinary error.";
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
        .map((asset) => asset.publicId.trim().replace(/^\/+/, ""))
        .filter((publicId) => publicId.startsWith(`${CLOUDINARY_TESTIMONIALS_FOLDER}/`))
    )
  );
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

async function cleanupTestimonialCloudinary(doc: Record<string, unknown>) {
  const reviewAssetFolder =
    typeof doc.reviewAssetFolder === "string" ? normalizeFolderPath(doc.reviewAssetFolder) : "";
  const uploadSessionId =
    typeof doc.uploadSessionId === "string" ? normalizeFolderPath(doc.uploadSessionId) : "";
  const fallbackRootFolder =
    reviewAssetFolder || (uploadSessionId ? `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}` : "");
  const assetUrls = collectTestimonialAssetUrls(doc);
  const publicIds = getPublicIdsFromUrls(assetUrls);

  if (fallbackRootFolder) {
    const cleanupResults = await deleteManagedCloudinaryFolderTree(
      fallbackRootFolder,
      [CLOUDINARY_TESTIMONIALS_FOLDER]
    );

    const failedCleanup = cleanupResults.find((result) => !result.ok);
    if (failedCleanup) {
      throw new Error(`Cloudinary cleanup failed for ${failedCleanup.target}: ${failedCleanup.error}`);
    }
  }

  if (publicIds.length > 0) {
    const publicIdResult = await deleteAssetsByPublicIds(publicIds);
    if (!publicIdResult.ok) {
      throw new Error(
        `Cloudinary asset cleanup failed for ${publicIdResult.target}: ${publicIdResult.error}`
      );
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