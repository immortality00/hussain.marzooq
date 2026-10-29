import { revalidatePath } from "next/cache";
import { revalidateMediaSurfaces } from "@/app/api/_lib/revalidate";
import { listAdminPrivateGalleries, storedGallery } from "@/lib/server/admin-lists";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { noStoreJson } from "@/app/api/_lib/common";
import { isFutureDate } from "@/lib/private-galleries";
import { accessFields, parseGalleryBody } from "@/app/api/private-galleries/_lib/gallery-body";
import {
  ensureUniquePrivateGallerySlug,
  validatePrivateGalleryMediaIds,
} from "@/lib/server/private-gallery-admin";
import {
  formatGalleryConversionError,
  makeMediaPrivateForGallery,
} from "@/lib/server/private-gallery-assets";
import { resolveGalleryPageUsage } from "@/app/api/private-galleries/_lib/gallery-page-usage";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  return noStoreJson({ ok: true, items: await listAdminPrivateGalleries() });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const parsed = parseGalleryBody(await req.json().catch(() => null));
  if (!parsed.ok) return parsed.response;
  const body = parsed.value;

  if (!isFutureDate(body.expiresAtUtc)) {
    return noStoreJson({ ok: false, error: "Expiry date must be in the future." }, { status: 400 });
  }

  const access = await accessFields(body, null);
  if (!access.ok) return noStoreJson({ ok: false, error: access.error }, { status: 400 });

  const db = await getDb();
  const validatedMedia = await validatePrivateGalleryMediaIds(db, body.rawMediaIds);
  if (!validatedMedia.ok) {
    return noStoreJson({ ok: false, error: validatedMedia.error }, { status: 400 });
  }

  // Only a private gallery hides its photos; a public one leaves them as they are.
  if (body.visibility === "private") {
    const pageUsage = await resolveGalleryPageUsage(db, validatedMedia.mediaIds, body.clearPageUsages);
    if (pageUsage) return pageUsage;

    const madePrivate = await makeMediaPrivateForGallery(db, validatedMedia.mediaIds);
    if (madePrivate.failures.length > 0) {
      return noStoreJson(
        { ok: false, error: formatGalleryConversionError(madePrivate.failures) },
        { status: 502 }
      );
    }
  }

  const slug = await ensureUniquePrivateGallerySlug(db, { title: body.title, slugInput: body.slugInput });
  const now = new Date();

  const result = await db.collection("private_galleries").insertOne({
    title: body.title,
    slug,
    description: body.description || null,
    ...access.set,
    mediaIds: validatedMedia.mediaIds,
    isActive: body.isActive,
    expiresAtUtc: body.expiresAtUtc,
    expiresAt: body.expiresAtUtc,
    expiresAtLocal: body.expiresAtLocal,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/g/${slug}`);
  revalidateMediaSurfaces();

  return noStoreJson({ ok: true, id: String(result.insertedId), slug, item: await storedGallery(db, result.insertedId) });
}
