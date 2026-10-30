import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { draftAfterSave } from "@/lib/server/media-drafts";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 300;
const MEDIA_ID = /^[a-f0-9]{24}$/;
const BATCH_KEY = /^[A-Za-z0-9-]{8,64}$/;

/** One blog draft for the items a batch upload just created (U7). */
export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = await readJsonObject(req);
  const mediaIds = body && Array.isArray(body.mediaIds) ? body.mediaIds : null;
  if (
    !mediaIds ||
    mediaIds.length === 0 ||
    mediaIds.length > MAX_ITEMS ||
    !mediaIds.every((id): id is string => typeof id === "string" && MEDIA_ID.test(id))
  ) {
    return noStoreJson({ ok: false, error: "Send the new items' ids." }, { status: 400 });
  }
  const batchKey = typeof body?.batchKey === "string" && BATCH_KEY.test(body.batchKey) ? body.batchKey : null;

  const draft = await draftAfterSave(await getDb(), mediaIds, batchKey);
  if (draft.error) return noStoreJson({ ok: false, error: draft.error }, { status: 500 });
  return noStoreJson({ ok: true, id: draft.id });
}
