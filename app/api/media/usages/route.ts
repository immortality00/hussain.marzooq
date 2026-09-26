import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { asStringArray, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { findMediaUsageConflicts } from "@/lib/server/media-usage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = (await req.json().catch(() => null)) as unknown;
  const ids = asStringArray(isRecord(body) ? body.ids : null, 300).filter((id) => ObjectId.isValid(id));
  if (ids.length === 0) {
    return noStoreJson({ ok: false, error: "Choose at least one media item." }, { status: 400 });
  }

  const db = await getDb();
  const docs = await db
    .collection("media")
    .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }, { projection: { title: 1, publicId: 1 } })
    .toArray();
  const conflicts = await findMediaUsageConflicts(db, docs);

  return noStoreJson({
    ok: true,
    items: conflicts.map(({ id, title, usedOn }) => ({ id, title, usedOn })),
  });
}
