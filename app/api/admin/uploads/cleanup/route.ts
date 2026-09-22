import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { CLOUDINARY_MANAGED_FOLDERS } from "@/lib/cloudinary-folders";
import { deleteManagedCloudinaryAsset } from "@/lib/server/cloudinary-assets";

export const dynamic = "force-dynamic";

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

// Best-effort cleanup for an upload that was replaced or removed before the form
// holding it was ever saved — a save-time diff (the PATCH routes) can only clean up
// an asset it knows was once stored on a doc, so it never sees this one. Scoped to
// every managed folder, same allowlist the sign endpoint enforces, so this can only
// ever delete something this app itself uploaded.
export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = bodyUnknown && typeof bodyUnknown === "object" ? (bodyUnknown as Record<string, unknown>) : {};

  const asset = {
    url: asNonEmptyString(body.url),
    publicId: asNonEmptyString(body.publicId),
    resourceType: asNonEmptyString(body.resourceType),
    deliveryType: asNonEmptyString(body.deliveryType),
  };

  if (!asset.url && !asset.publicId) {
    return noStoreJson({ ok: false, error: "Missing url or publicId." }, { status: 400 });
  }

  const deleted = await deleteManagedCloudinaryAsset(asset, CLOUDINARY_MANAGED_FOLDERS);
  return noStoreJson({ ok: deleted });
}
