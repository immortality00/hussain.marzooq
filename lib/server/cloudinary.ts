import { v2 as cloudinary } from "cloudinary";

const DEFAULT_ROOT_FOLDER = "hm_visuals";
const TESTIMONIALS_FOLDER = `${DEFAULT_ROOT_FOLDER}/testimonials`;

type SignableValue = string | number;

const BLOCKED_SIGN_KEYS = new Set([
  "eager",
  "transformation",
  "invalidate",
  "eager_async",
  "eager_notification_url",
]);

const TESTIMONIAL_ALLOWED_KEYS = new Set([
  "folder",
  "timestamp",
  "upload_preset",
  "source",
]);

function getCloudName() {
  return (
    (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim()
  );
}

function getApiKey() {
  return (process.env.CLOUDINARY_API_KEY ?? "").trim();
}

function getApiSecret() {
  return (process.env.CLOUDINARY_API_SECRET ?? "").trim();
}

export function getCloudinaryPublicConfig() {
  return {
    cloudName: getCloudName(),
    apiKey: getApiKey(),
  };
}

export function isCloudinaryConfigured() {
  return Boolean(getCloudName() && getApiKey() && getApiSecret());
}

export function ensureCloudinaryConfigured() {
  const cloudName = getCloudName();
  const apiKey = getApiKey();
  const apiSecret = getApiSecret();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary config missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

function isStringOrNumber(value: unknown): value is SignableValue {
  return typeof value === "string" || typeof value === "number";
}

export function sanitizeCloudinaryFolder(raw: unknown) {
  if (typeof raw !== "string") return DEFAULT_ROOT_FOLDER;

  const value = raw.trim();
  if (!value) return DEFAULT_ROOT_FOLDER;
  if (!value.startsWith(DEFAULT_ROOT_FOLDER)) return DEFAULT_ROOT_FOLDER;
  if (value.includes("..") || value.includes("\\") || value.includes("//")) {
    return DEFAULT_ROOT_FOLDER;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function sanitizeAdminParamsToSign(
  raw: unknown
): Record<string, SignableValue> | null {
  if (!raw || typeof raw !== "object") return null;

  const paramsToSign: Record<string, SignableValue> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (BLOCKED_SIGN_KEYS.has(key)) continue;
    if (!isStringOrNumber(value)) continue;
    paramsToSign[key] = value;
  }

  paramsToSign.folder = sanitizeCloudinaryFolder(paramsToSign.folder);
  return paramsToSign;
}

export function signCloudinaryParams(paramsToSign: Record<string, SignableValue>) {
  const { apiSecret } = ensureCloudinaryConfigured();
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

export function getTestimonialsFolder() {
  return TESTIMONIALS_FOLDER;
}

export function getTestimonialsUploadPreset() {
  return (
    (process.env.CLOUDINARY_UPLOAD_PRESET ?? "").trim() ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "").trim()
  );
}

export function sanitizeTestimonialsParamsToSign(
  raw: unknown
): Record<string, SignableValue> | null {
  if (!raw || typeof raw !== "object") return null;

  const source = raw as Record<string, unknown>;
  const paramsToSign: Record<string, SignableValue> = {};

  for (const [key, value] of Object.entries(source)) {
    if (!TESTIMONIAL_ALLOWED_KEYS.has(key)) continue;
    if (!isStringOrNumber(value)) continue;
    paramsToSign[key] = value;
  }

  paramsToSign.folder = TESTIMONIALS_FOLDER;

  const uploadPreset = getTestimonialsUploadPreset();
  if (uploadPreset) {
    paramsToSign.upload_preset = uploadPreset;
  }

  if (typeof paramsToSign.source !== "string" || !paramsToSign.source.trim()) {
    paramsToSign.source = "uw";
  }

  return paramsToSign;
}