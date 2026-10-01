import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { buildAdminSnapshot, snapshotVersion } from "@/lib/server/admin-snapshot";
import { scheduleUploadSweep } from "@/lib/server/upload-ledger";
import { adminMediaCount, KNOWN_VERSION_HEADER, MEDIA_COUNT_HEADER } from "@/lib/admin-data";
import { errorMessage } from "@/lib/error-message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  scheduleUploadSweep();
  const startedAt = performance.now();

  try {
    const data = await buildAdminSnapshot({ mediaCount: adminMediaCount(req.headers.get(MEDIA_COUNT_HEADER)) });
    const version = snapshotVersion(data);
    const unchanged = req.headers.get(KNOWN_VERSION_HEADER) === version;
    const body = JSON.stringify(unchanged ? { ok: true, unchanged: true, version } : { ok: true, version, data });
    const timing = `build;dur=${Math.round(performance.now() - startedAt)}, size;desc="${body.length}"`;
    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Server-Timing": timing,
      },
    });
  } catch (error) {
    console.error("[admin-snapshot] build failed", error);
    return noStoreJson(
      { ok: false, error: `Could not load the admin data: ${errorMessage(error, "the database did not answer")}.` },
      { status: 500 }
    );
  }
}
