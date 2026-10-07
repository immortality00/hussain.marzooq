import { noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { deleteManagedCloudinaryFolderTree } from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";
import { getDb } from "@/lib/server/db";
import {
  deleteUploadSession,
  readUploadCookie,
  sessionFolder,
  verifyUploadSession,
} from "@/lib/server/testimonial-upload-sessions";
import { withRouteErrors } from "@/app/api/_lib/route-errors";

export const dynamic = "force-dynamic";

const CLEANUP_RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_RATE_LIMIT_MAX = 12;

async function handlePost(request: Request) {
  const clientKey = getClientAddress(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-session-cleanup",
    key: clientKey,
    limit: CLEANUP_RATE_LIMIT_MAX,
    windowMs: CLEANUP_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson({ ok: false, error: "Too many cleanup attempts. Try again later." }, { status: 429 });
  }

  const db = await getDb();
  const session = await verifyUploadSession(db, readUploadCookie(request), { requirePending: true });

  if (!session) {
    return noStoreJson({ ok: true });
  }

  const cleanupResults = await deleteManagedCloudinaryFolderTree(
    sessionFolder(session.sessionId),
    [CLOUDINARY_TESTIMONIALS_FOLDER]
  );
  const failedResult = cleanupResults.find((result) => !result.ok);

  if (failedResult) {
    console.error("[review-upload-cleanup] failed", failedResult.target, failedResult.error);
    return noStoreJson({ ok: false, error: "Could not remove the uploaded photos." }, { status: 502 });
  }

  await deleteUploadSession(db, session.sessionId);

  return noStoreJson({ ok: true });
}

export const POST = withRouteErrors(handlePost);
