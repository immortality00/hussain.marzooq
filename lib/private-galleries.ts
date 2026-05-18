import crypto from "crypto";

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