import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import {
  deleteManagedCloudinaryAsset,
  parseCloudinaryAssetFromUrl,
} from "@/lib/server/cloudinary-assets";
import { getDb } from "@/lib/server/db";
import {
  readUploadCookie,
  sessionFolder,
  verifyUploadSession,
} from "@/lib/server/testimonial-upload-sessions";

export const dynamic = "force-dynamic";

const DISCARD_RATE_LIMIT_WINDOW_MS = 60_000;
const DISCARD_RATE_LIMIT_MAX = 30;

export async function POST(request: Request) {
  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-discard",
    key: getClientAddress(request),
    limit: DISCARD_RATE_LIMIT_MAX,
    windowMs: DISCARD_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const url = isRecord(bodyUnknown) && typeof bodyUnknown.url === "string" ? bodyUnknown.url : "";
  const parsed = url ? parseCloudinaryAssetFromUrl(url) : null;
  if (!parsed) {
    return noStoreJson({ ok: false, error: "Not an uploaded photo." }, { status: 400 });
  }

  const db = await getDb();
  const session = await verifyUploadSession(db, readUploadCookie(request), { requirePending: true });
  if (!session) {
    return noStoreJson({ ok: true });
  }

  const folder = sessionFolder(session.sessionId);
  if (!parsed.publicId.startsWith(`${folder}/`)) {
    return noStoreJson({ ok: false, error: "Photo does not belong to this session." }, { status: 403 });
  }

  const deleted = await deleteManagedCloudinaryAsset({ url }, [folder]);
  return noStoreJson({ ok: deleted });
}
