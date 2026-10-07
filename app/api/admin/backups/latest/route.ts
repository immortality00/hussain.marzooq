import { getStore } from "@netlify/blobs";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { BACKUP_PREFIX, BACKUP_STORE, latestBackupKey } from "@/lib/server/db-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  let store: ReturnType<typeof getStore>;
  try {
    store = getStore(BACKUP_STORE);
  } catch {
    return noStoreJson({ ok: false, error: "Backups are only available on the live site." }, { status: 503 });
  }

  const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
  const key = latestBackupKey(blobs.map((blob) => blob.key));
  const data = key ? await store.get(key, { type: "arrayBuffer" }) : null;
  if (!key || !data) return noStoreJson({ ok: false, error: "No backup yet." }, { status: 404 });

  return new Response(data, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="hussain-art-${key.slice(BACKUP_PREFIX.length)}"`,
      "Cache-Control": "no-store",
    },
  });
}
