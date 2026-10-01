import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { buildAdminSnapshot, snapshotVersion } from "@/lib/server/admin-snapshot";
import { scheduleUploadSweep } from "@/lib/server/upload-ledger";
import { KNOWN_VERSION_HEADER } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  scheduleUploadSweep();
  const data = await buildAdminSnapshot();
  const version = snapshotVersion(data);

  if (req.headers.get(KNOWN_VERSION_HEADER) === version) {
    return noStoreJson({ ok: true, unchanged: true, version });
  }
  return noStoreJson({ ok: true, version, data });
}
