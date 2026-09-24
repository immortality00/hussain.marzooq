import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import {
  getCloudinaryPublicConfig,
  isCloudinaryConfigured,
  signCloudinaryParams,
} from "@/lib/server/cloudinary";
import { getDb } from "@/lib/server/db";
import { newUploadPublicId } from "@/lib/server/upload-ledger";
import {
  claimUploadSlot,
  readUploadCookie,
  sessionPhotosFolder,
  sessionProfileFolder,
  verifyUploadSession,
} from "@/lib/server/testimonial-upload-sessions";

export const dynamic = "force-dynamic";

const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60_000;
const SIGNATURE_RATE_LIMIT_MAX = 18;

function requestedFolder(body: unknown) {
  if (!isRecord(body) || !isRecord(body.paramsToSign)) return "";
  const folder = body.paramsToSign.folder;
  return typeof folder === "string" ? folder.trim() : "";
}

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return noStoreJson({ error: "Cloudinary config missing." }, { status: 500 });
  }

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-signature",
    key: getClientAddress(request),
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

  const folder = requestedFolder(await request.json().catch(() => null));
  const allowedFolders = [sessionProfileFolder(session.sessionId), sessionPhotosFolder(session.sessionId)];

  if (!allowedFolders.includes(folder)) {
    return noStoreJson({ error: "Upload folder is not allowed for this session." }, { status: 400 });
  }

  if (!(await claimUploadSlot(db, session.sessionId))) {
    return noStoreJson({ error: "Upload limit reached for this session." }, { status: 403 });
  }

  const publicId = newUploadPublicId(folder);
  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp });
  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  return noStoreJson({ signature, cloudName, apiKey, publicId, timestamp });
}
