import { v2 as cloudinary } from "cloudinary";
import { isRecord, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TESTIMONIALS_FOLDER = "hm_visuals/testimonials";
const MAX_TIMESTAMP_AGE_SECONDS = 10 * 60;
const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60_000;
const SIGNATURE_RATE_LIMIT_MAX = 18;

const signatureAttempts = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_SIGN_KEYS = new Set([
  "timestamp",
  "upload_preset",
  "source",
  "custom_coordinates",
]);

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = signatureAttempts.get(key);

  if (!existing || existing.resetAt <= now) {
    signatureAttempts.set(key, { count: 1, resetAt: now + SIGNATURE_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > SIGNATURE_RATE_LIMIT_MAX;
}

function toValidTimestamp(value: unknown) {
  const timestamp = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(timestamp)) return null;

  const secondsNow = Math.floor(Date.now() / 1000);
  const roundedTimestamp = Math.round(timestamp);
  const age = Math.abs(secondsNow - roundedTimestamp);

  if (age > MAX_TIMESTAMP_AGE_SECONDS) return null;

  return roundedTimestamp;
}

function sanitizeParamsToSign(rawParams: Record<string, unknown>) {
  const paramsToSign: Record<string, string | number> = {
    folder: TESTIMONIALS_FOLDER,
  };

  for (const [key, value] of Object.entries(rawParams)) {
    if (!ALLOWED_SIGN_KEYS.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    paramsToSign[key] = value;
  }

  return paramsToSign;
}

export async function POST(request: Request) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

  if (!apiSecret) {
    return noStoreJson({ error: "Missing CLOUDINARY_API_SECRET." }, { status: 500 });
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return noStoreJson({ error: "Cloudinary config missing." }, { status: 500 });
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return noStoreJson({ error: "Too many upload attempts. Try again later." }, { status: 429 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};
  const rawParams = body.paramsToSign;

  if (!isRecord(rawParams)) {
    return noStoreJson({ error: "Missing paramsToSign." }, { status: 400 });
  }

  const paramsToSign = sanitizeParamsToSign(rawParams);

  const timestamp = toValidTimestamp(paramsToSign.timestamp);
  if (timestamp === null) {
    return noStoreJson({ error: "Invalid upload timestamp." }, { status: 400 });
  }

  paramsToSign.timestamp = timestamp;

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return noStoreJson({ signature });
}