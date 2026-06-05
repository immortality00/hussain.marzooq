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
  makeGallerySlug,
  normalizeLocalDateTimeString,
  parseClientLocalDateTimeToUtc,
} from "@/lib/private-galleries";

export const dynamic = "force-dynamic";

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  const db = await getDb();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const found = await db.collection("private_galleries").findOne({ slug });
    if (!found) return slug;
    if (excludeId && String(found._id) === excludeId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const db = await getDb();

  const doc = await db.collection("private_galleries").findOne({ _id: oid });
  if (!doc) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  return noStoreJson({
    ok: true,
    item: {
      id: String(doc._id),
      title: typeof doc.title === "string" ? doc.title : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      description: typeof doc.description === "string" ? doc.description : null,
      mediaIds: asStringArray(doc.mediaIds),
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      expiresAtLocal:
        typeof doc.expiresAtLocal === "string"
          ? normalizeLocalDateTimeString(doc.expiresAtLocal)
          : "",
    },
  });
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
  const mediaIds = asStringArray(body.mediaIds, 300);
  const isActive = asBooleanOrNull(body.isActive) ?? true;
  const expiresAtLocal = normalizeLocalDateTimeString(asNullableString(body.expiresAtLocal) ?? "");
  const timezoneOffsetMinutes = Number(body.timezoneOffsetMinutes);

  if (!title) {
    return noStoreJson({ ok: false, error: "Title is required." }, { status: 400 });
  }

  if (mediaIds.length === 0) {
    return noStoreJson({ ok: false, error: "Select at least one media item." }, { status: 400 });
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

  const baseSlug = makeGallerySlug(slugInput || title);
  const slug = await ensureUniqueSlug(baseSlug, id);

  const set: Record<string, unknown> = {
    title,
    slug,
    description: description || null,
    mediaIds,
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

  const db = await getDb();

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