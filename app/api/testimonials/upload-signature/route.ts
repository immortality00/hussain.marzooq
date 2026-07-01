import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { signCloudinaryParams } from "@/lib/server/cloudinary";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

const TESTIMONIALS_FOLDER = CLOUDINARY_TESTIMONIALS_FOLDER;
const MAX_TIMESTAMP_AGE_SECONDS = 10 * 60;
const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60_000;
const SIGNATURE_RATE_LIMIT_MAX = 18;

const ALLOWED_SIGN_KEYS = new Set([
  "folder",
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

function toValidTimestamp(value: unknown) {
  const timestamp = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(timestamp)) return null;

  const secondsNow = Math.floor(Date.now() / 1000);
  const roundedTimestamp = Math.round(timestamp);
  const age = Math.abs(secondsNow - roundedTimestamp);

  if (age > MAX_TIMESTAMP_AGE_SECONDS) return null;

  return roundedTimestamp;
}

function isSafeTestimonialFolder(value: string) {
  if (!value.startsWith(`${TESTIMONIALS_FOLDER}/`) && value !== TESTIMONIALS_FOLDER) {
    return false;
  }

  if (value.includes("..")) {
    return false;
  }

  return /^[A-Za-z0-9_\/-]+$/.test(value);
}

function sanitizeParamsToSign(rawParams: Record<string, unknown>) {
  const paramsToSign: Record<string, string | number> = {
    folder: TESTIMONIALS_FOLDER,
  };

  for (const [key, value] of Object.entries(rawParams)) {
    if (!ALLOWED_SIGN_KEYS.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;

    if (key === "folder") {
      const folderValue = String(value).trim();
      if (isSafeTestimonialFolder(folderValue)) {
        paramsToSign.folder = folderValue;
      }
      continue;
    }

    paramsToSign[key] = value;
  }

  return paramsToSign;
}

export async function POST(request: Request) {
  if (
    !process.env.CLOUDINARY_API_SECRET ||
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY
  ) {
    return noStoreJson({ error: "Cloudinary config missing." }, { status: 500 });
  }

  const clientKey = getClientKey(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-signature",
    key: clientKey,
    limit: SIGNATURE_RATE_LIMIT_MAX,
    windowMs: SIGNATURE_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
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

  const signature = signCloudinaryParams(paramsToSign);

  return noStoreJson({ signature });
}