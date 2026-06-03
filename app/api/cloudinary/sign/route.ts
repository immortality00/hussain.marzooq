import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import {
  getCloudinaryPublicConfig,
  isCloudinaryConfigured,
  sanitizeCloudinaryFolder,
  signCloudinaryParams,
} from "@/lib/server/cloudinary";
import { CLOUDINARY_ROOT_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  if (!isCloudinaryConfigured()) {
    return noStoreJson({ ok: false, error: "Cloudinary config missing." }, { status: 500 });
  }

  const folder = sanitizeCloudinaryFolder(CLOUDINARY_ROOT_FOLDER);

  if (!folder) {
    return noStoreJson(
      { ok: false, error: "Cloudinary upload folder is not configured correctly." },
      { status: 500 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
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