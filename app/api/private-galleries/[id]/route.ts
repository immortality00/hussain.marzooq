import { revalidatePath } from "next/cache";
import { revalidateMediaSurfaces } from "@/app/api/_lib/revalidate";
import { getDb } from "@/lib/server/db";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { changedSinceOpened, recordChangedResponse } from "@/app/api/_lib/record-version";
import { storedGallery } from "@/lib/server/admin-lists";
import { asStringArray, noStoreJson } from "@/app/api/_lib/common";
import { getPrivateGalleryExpiryDate, isFutureDate, isSameExpiryInstant } from "@/lib/private-galleries";
import { accessFields, parseGalleryBody } from "@/app/api/private-galleries/_lib/gallery-body";
import { GALLERY_MAX_ITEMS } from "@/lib/admin-data";
import {
  ensureUniquePrivateGallerySlug,
  serializePrivateGalleryAdminItem,
  validatePrivateGalleryMediaIds,
} from "@/lib/server/private-gallery-admin";
import {
  formatGalleryConversionError,
  makeMediaPrivateForGallery,
  releaseMediaFromPrivateGalleries,
} from "@/lib/server/private-gallery-assets";
import { resolveGalleryPageUsage } from "@/app/api/private-galleries/_lib/gallery-page-usage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "private_galleries", oid);
  if (found instanceof Response) return found;

  return noStoreJson({ ok: true, item: serializePrivateGalleryAdminItem(found.doc) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const parsed = parseGalleryBody(await req.json().catch(() => null));
  if (!parsed.ok) return parsed.response;
  const body = parsed.value;

  const db = await getDb();
  const found = await findByIdOr404(db, "private_galleries", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;
  if (changedSinceOpened(req, existing)) return recordChangedResponse(await storedGallery(db, oid));

  const expiryUnchanged = isSameExpiryInstant(
    body.expiresAtUtc,
    getPrivateGalleryExpiryDate(existing)
  );

  if (!expiryUnchanged && !isFutureDate(body.expiresAtUtc)) {
    return noStoreJson(
      { ok: false, error: "Expiry date must be in the future." },
      { status: 400 }
    );
  }

  const access = await accessFields(body, existing);
  if (!access.ok) return noStoreJson({ ok: false, error: access.error }, { status: 400 });

  const previousSlug = typeof existing.slug === "string" ? existing.slug : null;

  const validatedMedia = await validatePrivateGalleryMediaIds(db, body.rawMediaIds);
  if (!validatedMedia.ok) {
    return noStoreJson({ ok: false, error: validatedMedia.error }, { status: 400 });
  }

  const isPrivate = body.visibility === "private";
  const previousMediaIds = asStringArray(existing.mediaIds, GALLERY_MAX_ITEMS);
  const nextMediaIds = validatedMedia.mediaIds;
  // Photos this save takes out of a private gallery: the ones removed, or every one when it turns public.
  const releasedMediaIds = isPrivate
    ? previousMediaIds.filter((mediaId) => !nextMediaIds.includes(mediaId))
    : previousMediaIds;

  // Only a private gallery hides its photos; a public one leaves them as they are.
  if (isPrivate) {
    const pageUsage = await resolveGalleryPageUsage(db, nextMediaIds, body.clearPageUsages);
    if (pageUsage) return pageUsage;

    const madePrivate = await makeMediaPrivateForGallery(db, nextMediaIds);
    if (madePrivate.failures.length > 0) {
      return noStoreJson(
        { ok: false, error: formatGalleryConversionError(madePrivate.failures) },
        { status: 502 }
      );
    }
  }

  const slug = await ensureUniquePrivateGallerySlug(db, { title: body.title, slugInput: body.slugInput, excludeId: id });

  const set: Record<string, unknown> = {
    title: body.title,
    slug,
    description: body.description || null,
    ...access.set,
    mediaIds: nextMediaIds,
    isActive: body.isActive,
    expiresAtUtc: body.expiresAtUtc,
    expiresAt: body.expiresAtUtc,
    expiresAtLocal: body.expiresAtLocal,
    updatedAt: new Date(),
  };

  const result = await db.collection("private_galleries").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  await releaseMediaFromPrivateGalleries(db, releasedMediaIds);

  revalidatePath(`/g/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/g/${previousSlug}`);
  revalidateMediaSurfaces();

  return noStoreJson({ ok: true, slug, item: await storedGallery(db, oid) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();

  const found = await findByIdOr404(db, "private_galleries", oid, {
    projection: { slug: 1, mediaIds: 1 },
  });
  if (found instanceof Response) return found;
  const existing = found.doc;

  const slug = typeof existing.slug === "string" ? existing.slug : null;
  const releasedMediaIds = asStringArray(existing.mediaIds, GALLERY_MAX_ITEMS);

  const result = await db.collection("private_galleries").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  await releaseMediaFromPrivateGalleries(db, releasedMediaIds);

  if (slug) revalidatePath(`/g/${slug}`);
  revalidateMediaSurfaces();

  return noStoreJson({ ok: true });
}