import { isRecord, asNullableString, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { deleteManagedCloudinaryFolderTree } from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

const CLEANUP_RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_RATE_LIMIT_MAX = 12;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function POST(request: Request) {
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

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};
  const uploadSessionId = (asNullableString(body.uploadSessionId) ?? "").trim().slice(0, 120);

  if (!uploadSessionId || !SESSION_ID_PATTERN.test(uploadSessionId)) {
    return noStoreJson({ ok: false, error: "Invalid upload session id." }, { status: 400 });
  }

  const sessionFolder = `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}`;
  const cleanupResults = await deleteManagedCloudinaryFolderTree(sessionFolder, [CLOUDINARY_TESTIMONIALS_FOLDER]);
  const failedResult = cleanupResults.find((result) => !result.ok);

  if (failedResult) {
    return noStoreJson(
      { ok: false, error: failedResult.error ?? "Cloudinary cleanup failed." },
      { status: 502 },
    );
  }

  return noStoreJson({ ok: true });
}
