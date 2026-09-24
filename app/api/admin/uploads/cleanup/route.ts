import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { parseCloudinaryAssetFromUrl } from "@/lib/server/cloudinary-assets";
import { getDb } from "@/lib/server/db";
import { discardPendingUpload } from "@/lib/server/upload-ledger";

export const dynamic = "force-dynamic";

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = bodyUnknown && typeof bodyUnknown === "object" ? (bodyUnknown as Record<string, unknown>) : {};

  const url = asNonEmptyString(body.url);
  const publicId =
    asNonEmptyString(body.publicId) ?? (url ? parseCloudinaryAssetFromUrl(url)?.publicId : undefined);

  if (!publicId) {
    return noStoreJson({ ok: false, error: "Missing publicId or Cloudinary url." }, { status: 400 });
  }

  const result = await discardPendingUpload(await getDb(), publicId);
  return noStoreJson({ ok: result !== "failed", result });
}
