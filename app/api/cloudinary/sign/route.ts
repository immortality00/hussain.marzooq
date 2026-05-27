import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import {
  getCloudinaryPublicConfig,
  isCloudinaryConfigured,
  signCloudinaryParams,
  sanitizeCloudinaryFolder,
} from "@/lib/server/cloudinary";

export const dynamic = "force-dynamic";

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  if (!isCloudinaryConfigured()) {
    return noStoreJson({ ok: false, error: "Cloudinary config missing." }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = sanitizeCloudinaryFolder("hm_visuals");
  const signature = signCloudinaryParams({ timestamp, folder });
  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  return noStoreJson({
    ok: true,
    timestamp,
    signature,
    cloudName,
    apiKey,
    folder,
  });
}