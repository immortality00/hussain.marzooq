import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asBooleanOrNull,
  asNullableString,
  asStringArray,
  isRecord,
  noStoreJson,
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

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const db = await getDb();

  const docs = await db
    .collection("private_galleries")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  return noStoreJson({ ok: true, items: docs.map(serializePrivateGalleryAdminItem) });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

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

  if (!password || password.length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
    return noStoreJson(
      {
        ok: false,
        error: `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 }
    );
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
  const validatedMedia = await validatePrivateGalleryMediaIds(db, rawMediaIds);
  if (!validatedMedia.ok) {
    return noStoreJson({ ok: false, error: validatedMedia.error }, { status: 400 });
  }

  const slug = await ensureUniquePrivateGallerySlug(db, { title, slugInput });
  const passwordHash = await hashGalleryPassword(password);
  const accessToken = makeGalleryAccessToken();
  const now = new Date();

  const result = await db.collection("private_galleries").insertOne({
    title,
    slug,
    description: description || null,
    passwordHash,
    accessToken,
    mediaIds: validatedMedia.mediaIds,
    isActive,
    expiresAtUtc,
    expiresAt: expiresAtUtc,
    expiresAtLocal,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/g/${slug}`);

  return noStoreJson({ ok: true, id: String(result.insertedId), slug });
}