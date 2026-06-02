import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_MANAGED_FOLDERS,
  CLOUDINARY_ROOT_FOLDER,
  CLOUDINARY_TESTIMONIALS_FOLDER,
} from "@/lib/cloudinary-folders";

type SignableValue = string | number;

const BLOCKED_SIGN_KEYS = new Set([
  "eager",
  "transformation",
  "invalidate",
  "eager_async",
  "eager_notification_url",
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

function normalizeFolder(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function isManagedFolder(folder: string) {
  const normalized = normalizeFolder(folder);

  return CLOUDINARY_MANAGED_FOLDERS.some(
    (baseFolder) =>
      normalized === baseFolder || normalized.startsWith(`${baseFolder}/`)
  );
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
  if (typeof raw !== "string") return null;

  const value = normalizeFolder(raw);
  if (!value) return null;
  if (!value.startsWith(CLOUDINARY_ROOT_FOLDER)) return null;
  if (value.includes("..") || value.includes("\\") || value.includes("//")) return null;
  if (!isManagedFolder(value)) return null;

  return value;
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

  const folder = sanitizeCloudinaryFolder(paramsToSign.folder);
  if (!folder) return null;

  paramsToSign.folder = folder;
  return paramsToSign;
}

export function signCloudinaryParams(paramsToSign: Record<string, SignableValue>) {
  const { apiSecret } = ensureCloudinaryConfigured();
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

export function getTestimonialsFolder() {
  return CLOUDINARY_TESTIMONIALS_FOLDER;
}