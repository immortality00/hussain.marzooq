import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import {
  getCloudinaryPublicConfig,
  isCloudinaryConfigured,
  sanitizeAdminParamsToSign,
  signCloudinaryParams,
} from "@/lib/server/cloudinary";
import { getDb } from "@/lib/server/db";
import {
  newUploadPublicId,
  registerAssetUpload,
  scheduleUploadSweep,
} from "@/lib/server/upload-ledger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  if (!isCloudinaryConfigured()) {
    return noStoreJson({ error: "Cloudinary config missing." }, { status: 500 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body =
    bodyUnknown && typeof bodyUnknown === "object"
      ? (bodyUnknown as Record<string, unknown>)
      : {};

  const requested = sanitizeAdminParamsToSign(body.paramsToSign);
  if (!requested) {
    return noStoreJson({ error: "Invalid or missing paramsToSign." }, { status: 400 });
  }

  const publicId = newUploadPublicId(String(requested.folder));
  const timestamp = Math.round(Date.now() / 1000);

  await registerAssetUpload(await getDb(), publicId);

  const signature = signCloudinaryParams({ public_id: publicId, timestamp });
  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  scheduleUploadSweep();

  return noStoreJson({ signature, cloudName, apiKey, publicId, timestamp });
}
