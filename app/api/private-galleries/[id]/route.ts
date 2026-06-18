import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asBooleanOrNull,
  asNullableString,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";
import {
  MIN_PRIVATE_GALLERY_PASSWORD_LENGTH,
  hashGalleryPassword,
  isFutureDate,
  makeGalleryAccessToken,
  normalizeLocalDateTimeString,
  parseClientLocalDateTimeToUtc,
} from "@/lib/private-galleries";
import {
  ensureUniquePrivateGallerySlug,
  serializePrivateGalleryAdminItem,
  validatePrivateGalleryMediaIds,
} from "@/lib/server/private-gallery-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const db = await getDb();
  const doc = await db.collection("private_galleries").findOne({ _id: oid });
  if (!doc) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  return noStoreJson({ ok: true, item: serializePrivateGalleryAdminItem(doc) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const title = (asNullableString(body.title) ?? "").trim().slice(0, 140);
  const slugInput = (asNullableString(body.slug) ?? "").trim();
  const description = (asNullableString(body.description) ?? "").trim().slice(0, 2000);
  const password = (asNullableString(body.password) ?? "").trim();
  const rawMediaIds = asStringArray(body.mediaIds, 300);
  const isActive = asBooleanOrNull(body.isActive) ?? true;
  const expiresAtLocal = normalizeLocalDateTimeString(asNullableString(body.expiresAtLocal) ?? "");
  const timezoneOffsetMinutes = Number(body.timezoneOffsetMinutes);

  if (!title) {
    return noStoreJson({ ok: false, error: "Title is required." }, { status: 400 });
  }

  if (!expiresAtLocal) {
    return noStoreJson({ ok: false, error: "Expiry date is required." }, { status: 400 });
  }

  if (!Number.isFinite(timezoneOffsetMinutes)) {
    return noStoreJson({ ok: false, error: "Timezone offset is required." }, { status: 400 });
  }

  const expiresAtUtc = parseClientLocalDateTimeToUtc(expiresAtLocal, timezoneOffsetMinutes);
  if (!isFutureDate(expiresAtUtc)) {
    return noStoreJson(
      { ok: false, error: "Expiry date must be in the future." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const existing = await db.collection("private_galleries").findOne({ _id: oid });
  if (!existing) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  const validatedMedia = await validatePrivateGalleryMediaIds(db, rawMediaIds);
  if (!validatedMedia.ok) {
    return noStoreJson({ ok: false, error: validatedMedia.error }, { status: 400 });
  }

  const slug = await ensureUniquePrivateGallerySlug(db, { title, slugInput, excludeId: id });

  const set: Record<string, unknown> = {
    title,
    slug,
    description: description || null,
    mediaIds: validatedMedia.mediaIds,
    isActive,
    expiresAtUtc,
    expiresAt: expiresAtUtc,
    expiresAtLocal,
    updatedAt: new Date(),
  };

  if (password) {
    if (password.length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
      return noStoreJson(
        {
          ok: false,
          error: `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    set.passwordHash = await hashGalleryPassword(password);
    set.accessToken = makeGalleryAccessToken();
  }

  const result = await db.collection("private_galleries").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  return noStoreJson({ ok: true, slug });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("private_galleries").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  return noStoreJson({ ok: true });
}