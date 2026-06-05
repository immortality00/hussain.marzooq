import crypto from "crypto";

export const MIN_PRIVATE_GALLERY_PASSWORD_LENGTH = 8;

export type PrivateGalleryDoc = {
  _id?: unknown;
  title: string;
  slug: string;
  description: string | null;
  passwordHash: string;
  accessToken: string;
  mediaIds: string[];
  isActive: boolean;
  expiresAtUtc: Date | null;
  expiresAtLocal: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function scryptAsync(password: string, salt: Buffer, keylen: number) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

function getPrivateGalleryCookieSecret() {
  return (
    (process.env.PRIVATE_GALLERY_COOKIE_SECRET ?? "").trim() ||
    (process.env.ADMIN_COOKIE_SECRET ?? "").trim()
  );
}

function timingSafeStringEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function signGalleryCookiePayload(galleryId: string, accessToken: string) {
  const secret = getPrivateGalleryCookieSecret();
  if (!secret) return null;

  return crypto
    .createHmac("sha256", secret)
    .update(`${galleryId}.${accessToken}`)
    .digest("hex");
}

export async function hashGalleryPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyGalleryPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split(":");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scryptAsync(password, salt, expected.length);

  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function makeGallerySlug(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || `gallery-${crypto.randomBytes(3).toString("hex")}`;
}

export function makeGalleryAccessToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function privateGalleryCookieName(id: string) {
  return `hm_gallery_${id}`;
}

export function createPrivateGalleryCookieValue(galleryId: string, accessToken: string) {
  const normalizedGalleryId = galleryId.trim();
  const normalizedAccessToken = accessToken.trim();
  if (!normalizedGalleryId || !normalizedAccessToken) return null;

  const signature = signGalleryCookiePayload(normalizedGalleryId, normalizedAccessToken);
  if (!signature) return null;

  return `v1.${normalizedAccessToken}.${signature}`;
}

export function verifyPrivateGalleryCookieValue(params: {
  galleryId: string;
  accessToken: string;
  cookieValue: string;
}) {
  const galleryId = params.galleryId.trim();
  const accessToken = params.accessToken.trim();
  const cookieValue = params.cookieValue.trim();

  if (!galleryId || !accessToken || !cookieValue) return false;

  const [version, tokenFromCookie, signatureFromCookie] = cookieValue.split(".");
  if (version !== "v1" || tokenFromCookie !== accessToken || !signatureFromCookie) return false;

  const expectedSignature = signGalleryCookiePayload(galleryId, accessToken);
  if (!expectedSignature) return false;

  return timingSafeStringEqual(signatureFromCookie, expectedSignature);
}

export function getPrivateGalleryExpiryDate(doc: Record<string, unknown>) {
  if (doc.expiresAtUtc instanceof Date) return doc.expiresAtUtc;
  if (doc.expiresAt instanceof Date) return doc.expiresAt;
  return null;
}

export function isPrivateGalleryExpired(expiresAt: Date | null | undefined) {
  return !!expiresAt && expiresAt.getTime() <= Date.now();
}

export function isPrivateGalleryUnavailable(doc: Record<string, unknown>) {
  const isActive = typeof doc.isActive === "boolean" ? doc.isActive : true;
  const expiresAt = getPrivateGalleryExpiryDate(doc);

  return !isActive || isPrivateGalleryExpired(expiresAt);
}

export function parseClientLocalDateTimeToUtc(
  localValue: string,
  timezoneOffsetMinutes: number
): Date | null {
  const raw = localValue.trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hours, minutes] = match;
  const utcMs =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      0,
      0
    ) +
    timezoneOffsetMinutes * 60_000;

  const date = new Date(utcMs);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFutureDate(value: Date | null) {
  return !!value && value.getTime() > Date.now();
}

export function normalizeLocalDateTimeString(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hours, minutes] = match;
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}