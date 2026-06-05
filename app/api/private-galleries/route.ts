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

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const db = await getDb();

  const docs = await db
    .collection("private_galleries")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = docs.map((doc) => ({
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
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

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

  if (!password || password.length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
    return noStoreJson(
      {
        ok: false,
        error: `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 }
    );
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
  const slug = await ensureUniqueSlug(baseSlug);
  const passwordHash = await hashGalleryPassword(password);
  const accessToken = makeGalleryAccessToken();

  const now = new Date();
  const db = await getDb();

  const result = await db.collection("private_galleries").insertOne({
    title,
    slug,
    description: description || null,
    passwordHash,
    accessToken,
    mediaIds,
    isActive,
    expiresAtUtc,
    expiresAt: expiresAtUtc,
    expiresAtLocal,
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true, id: String(result.insertedId), slug });
}