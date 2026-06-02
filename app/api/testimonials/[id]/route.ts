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
  deleteManagedCloudinaryUrls,
  deleteManagedEmptyCloudinaryFolders,
} from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

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

  const profilePhotoUrl = typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : "";
  const photoUrls = Array.isArray(doc.photoUrls)
    ? doc.photoUrls.filter((value): value is string => typeof value === "string")
    : [];

  const reviewProfileFolder =
    typeof doc.reviewProfileFolder === "string" ? doc.reviewProfileFolder : "";
  const reviewPhotosFolder =
    typeof doc.reviewPhotosFolder === "string" ? doc.reviewPhotosFolder : "";
  const reviewAssetFolder =
    typeof doc.reviewAssetFolder === "string" ? doc.reviewAssetFolder : "";

  const result = await db.collection("testimonials").deleteOne({ _id: oid });

  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  await deleteManagedCloudinaryUrls(
    [profilePhotoUrl, ...photoUrls].filter(Boolean),
    [CLOUDINARY_TESTIMONIALS_FOLDER]
  );

  await deleteManagedEmptyCloudinaryFolders(
    [reviewProfileFolder, reviewPhotosFolder, reviewAssetFolder].filter(Boolean),
    [CLOUDINARY_TESTIMONIALS_FOLDER]
  );

  return noStoreJson({ ok: true });
}