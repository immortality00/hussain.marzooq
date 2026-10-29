import {
  asBooleanOrNull,
  asNullableString,
  asStringArray,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import {
  MIN_PRIVATE_GALLERY_PASSWORD_LENGTH,
  galleryVisibilityOf,
  hashGalleryPassword,
  makeGalleryAccessToken,
  makeGalleryLinkKey,
  normalizeLocalDateTimeString,
  parseClientLocalDateTimeToUtc,
  type GalleryVisibility,
} from "@/lib/private-galleries";
import { GALLERY_MAX_ITEMS } from "@/lib/admin-data";

export type GalleryBody = {
  title: string;
  slugInput: string;
  description: string;
  password: string;
  visibility: GalleryVisibility;
  newLink: boolean;
  rawMediaIds: string[];
  isActive: boolean;
  expiresAtLocal: string;
  expiresAtUtc: Date;
  clearPageUsages: boolean;
};

const fail = (error: string) => ({ ok: false as const, response: noStoreJson({ ok: false, error }, { status: 400 }) });

export const PASSWORD_TOO_SHORT = `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`;

export function parseGalleryBody(body: unknown): { ok: true; value: GalleryBody } | ReturnType<typeof fail> {
  if (!isRecord(body)) return fail("Invalid body.");

  const visibility = body.visibility === undefined ? "private" : body.visibility;
  if (visibility !== "private" && visibility !== "public") return fail("Choose Private or Public.");

  const title = (asNullableString(body.title) ?? "").trim().slice(0, 140);
  const expiresAtLocal = normalizeLocalDateTimeString(asNullableString(body.expiresAtLocal) ?? "");
  const timezoneOffsetMinutes = Number(body.timezoneOffsetMinutes);

  if (!title) return fail("Title is required.");
  if (!expiresAtLocal) return fail("Expiry date is required.");
  if (!Number.isFinite(timezoneOffsetMinutes)) return fail("Timezone offset is required.");

  const expiresAtUtc = parseClientLocalDateTimeToUtc(expiresAtLocal, timezoneOffsetMinutes);
  if (!expiresAtUtc) return fail("Expiry date is required.");

  return {
    ok: true,
    value: {
      title,
      slugInput: (asNullableString(body.slug) ?? "").trim(),
      description: (asNullableString(body.description) ?? "").trim().slice(0, 2000),
      password: visibility === "private" ? (asNullableString(body.password) ?? "").trim() : "",
      visibility,
      newLink: body.newLink === true,
      rawMediaIds: asStringArray(body.mediaIds, GALLERY_MAX_ITEMS),
      isActive: asBooleanOrNull(body.isActive) ?? true,
      expiresAtLocal,
      expiresAtUtc,
      clearPageUsages: body.clearPageUsages === true,
    },
  };
}

// How the gallery opens, worked out against what it was (null for a new gallery):
// - switching visibility, or a new password, rotates accessToken, so every cookie set before stops working;
// - a public gallery has no password; a private gallery has no link;
// - a private gallery needs a password when it is new or was public.
export async function accessFields(
  body: GalleryBody,
  existing: Record<string, unknown> | null
): Promise<{ ok: true; set: Record<string, unknown> } | { ok: false; error: string }> {
  const was = existing ? galleryVisibilityOf(existing) : null;

  if (body.visibility === "public") {
    if (was === "public" && !body.newLink) return { ok: true, set: {} };
    const set: Record<string, unknown> = { visibility: "public", linkKey: makeGalleryLinkKey(), passwordHash: null };
    if (was !== "public") set.accessToken = makeGalleryAccessToken();
    return { ok: true, set };
  }

  const needsPassword = was !== "private";
  if (!body.password) return needsPassword ? { ok: false, error: PASSWORD_TOO_SHORT } : { ok: true, set: {} };
  if (body.password.length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) return { ok: false, error: PASSWORD_TOO_SHORT };

  return {
    ok: true,
    set: {
      visibility: "private",
      linkKey: null,
      passwordHash: await hashGalleryPassword(body.password),
      accessToken: makeGalleryAccessToken(),
    },
  };
}
