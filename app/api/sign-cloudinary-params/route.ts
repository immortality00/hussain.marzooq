import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import {
  getCloudinaryPublicConfig,
  isCloudinaryConfigured,
  sanitizeAdminParamsToSign,
  signCloudinaryParams,
} from "@/lib/server/cloudinary";

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

  const paramsToSign = sanitizeAdminParamsToSign(body.paramsToSign);
  if (!paramsToSign) {
    return noStoreJson({ error: "Invalid or missing paramsToSign." }, { status: 400 });
  }

  const signature = signCloudinaryParams(paramsToSign);
  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  return noStoreJson({
    signature,
    cloudName,
    apiKey,
  });
}