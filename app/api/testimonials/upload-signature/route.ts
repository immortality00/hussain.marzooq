import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { signCloudinaryParams } from "@/lib/server/cloudinary";
import { getDb } from "@/lib/server/db";
import {
  readUploadCookie,
  sessionPhotosFolder,
  sessionProfileFolder,
  verifyUploadSession,
} from "@/lib/server/testimonial-upload-sessions";

export const dynamic = "force-dynamic";

const MAX_TIMESTAMP_AGE_SECONDS = 10 * 60;
const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60_000;
const SIGNATURE_RATE_LIMIT_MAX = 18;

const ALLOWED_SIGN_KEYS = new Set(["timestamp", "upload_preset", "source", "custom_coordinates"]);

function toValidTimestamp(value: unknown) {
  const timestamp = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(timestamp)) return null;

  const secondsNow = Math.floor(Date.now() / 1000);
  const roundedTimestamp = Math.round(timestamp);
  const age = Math.abs(secondsNow - roundedTimestamp);

  if (age > MAX_TIMESTAMP_AGE_SECONDS) return null;

  return roundedTimestamp;
}

function sanitizeParamsToSign(rawParams: Record<string, unknown>, sessionId: string) {
  const allowedFolders = new Set([sessionProfileFolder(sessionId), sessionPhotosFolder(sessionId)]);
  const requestedFolder =
    typeof rawParams.folder === "string" ? rawParams.folder.trim() : "";

  if (!allowedFolders.has(requestedFolder)) return null;

  const paramsToSign: Record<string, string | number> = { folder: requestedFolder };

  for (const [key, value] of Object.entries(rawParams)) {
    if (key === "folder") continue;
    if (!ALLOWED_SIGN_KEYS.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;

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

  const clientKey = getClientAddress(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-signature",
    key: clientKey,
    limit: SIGNATURE_RATE_LIMIT_MAX,
    windowMs: SIGNATURE_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson({ error: "Too many upload attempts. Try again later." }, { status: 429 });
  }

  const db = await getDb();
  const session = await verifyUploadSession(db, readUploadCookie(request), { requirePending: true });

  if (!session) {
    return noStoreJson({ error: "Upload session is missing or invalid." }, { status: 403 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};
  const rawParams = body.paramsToSign;

  if (!isRecord(rawParams)) {
    return noStoreJson({ error: "Missing paramsToSign." }, { status: 400 });
  }

  const paramsToSign = sanitizeParamsToSign(rawParams, session.sessionId);

  if (!paramsToSign) {
    return noStoreJson({ error: "Upload folder is not allowed for this session." }, { status: 400 });
  }

  const timestamp = toValidTimestamp(paramsToSign.timestamp);
  if (timestamp === null) {
    return noStoreJson({ error: "Invalid upload timestamp." }, { status: 400 });
  }

  paramsToSign.timestamp = timestamp;

  const signature = signCloudinaryParams(paramsToSign);

  return noStoreJson({ signature });
}
