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
import {
  deleteManagedCloudinaryResourcesByPrefix,
  deleteManagedCloudinaryUrls,
  deleteManagedEmptyCloudinaryFolders,
} from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

function normalizeFolderPath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function isSafeTestimonialSessionFolder(folder: string) {
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

function collectTestimonialAssetUrls(doc: Record<string, unknown>) {
  const profilePhotoUrl = typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : "";
  const photoUrls = getStringArray(doc.photoUrls);

  return [profilePhotoUrl, ...photoUrls].filter(Boolean);
}

function collectTestimonialFolders(doc: Record<string, unknown>) {
  const reviewAssetFolder =
    typeof doc.reviewAssetFolder === "string" ? normalizeFolderPath(doc.reviewAssetFolder) : "";
  const reviewProfileFolder =
    typeof doc.reviewProfileFolder === "string" ? normalizeFolderPath(doc.reviewProfileFolder) : "";
  const reviewPhotosFolder =
    typeof doc.reviewPhotosFolder === "string" ? normalizeFolderPath(doc.reviewPhotosFolder) : "";

  const folders = [reviewProfileFolder, reviewPhotosFolder, reviewAssetFolder].filter(
    isSafeTestimonialSessionFolder
  );

  return Array.from(new Set(folders));
}

async function deleteTestimonialCloudinaryAssets(doc: Record<string, unknown>) {
  const reviewAssetFolder =
    typeof doc.reviewAssetFolder === "string" ? normalizeFolderPath(doc.reviewAssetFolder) : "";

  if (isSafeTestimonialSessionFolder(reviewAssetFolder)) {
    await deleteManagedCloudinaryResourcesByPrefix(reviewAssetFolder, [
      CLOUDINARY_TESTIMONIALS_FOLDER,
    ]);
  }

  await deleteManagedCloudinaryUrls(collectTestimonialAssetUrls(doc), [
    CLOUDINARY_TESTIMONIALS_FOLDER,
  ]);

  await deleteManagedEmptyCloudinaryFolders(collectTestimonialFolders(doc), [
    CLOUDINARY_TESTIMONIALS_FOLDER,
  ]);
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

  const result = await db.collection("testimonials").deleteOne({ _id: oid });

  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  await deleteTestimonialCloudinaryAssets(doc as Record<string, unknown>);

  return noStoreJson({ ok: true });
}