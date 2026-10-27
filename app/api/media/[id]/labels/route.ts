import { asStringArray, noStoreJson } from "@/app/api/_lib/common";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { resolvePeopleSelection } from "@/app/api/_lib/media";
import { resolvePageUsageBeforeLock } from "@/app/api/_lib/media-usage";
import { changedSinceOpened, recordChangedResponse } from "@/app/api/_lib/record-version";
import { revalidateMediaSurfaces } from "@/app/api/_lib/revalidate";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { savedAdminMedia } from "@/lib/server/admin-media";
import { getDb } from "@/lib/server/db";
import { deliveryFailureText, syncMediaDelivery } from "@/lib/server/media-delivery";
import { findUnknownNewTag, parseLabelPatch } from "../_lib/label-patch";
import { mustStayHidden, type MediaSet } from "../_lib/media-set";

export const dynamic = "force-dynamic";

// Tags and people only, from the media list — the rest of the item is left as it is.
async function patchLabels(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const parsed = parseLabelPatch(await readJsonObject(req));
  if (!parsed.ok) return noStoreJson({ ok: false, error: parsed.error }, { status: 400 });
  const { tags, peopleIds, clearPageUsages } = parsed.patch;

  const db = await getDb();
  const found = await findByIdOr404(db, "media", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;
  if (changedSinceOpened(req, existing)) return recordChangedResponse(await savedAdminMedia(db, existing));

  const set: MediaSet = { updatedAt: new Date() };

  if (tags) {
    const unknown = await findUnknownNewTag(db, tags, asStringArray(existing.tags, 1000));
    if (unknown) return noStoreJson({ ok: false, error: `“${unknown}” is not in Tags.` }, { status: 400 });
    set.tags = tags;
  }

  if (peopleIds) {
    const resolved = await resolvePeopleSelection(db, { peopleIds });
    set.peopleIds = resolved.peopleIds;
    set.people = resolved.people;
    if (await mustStayHidden(db, oid, resolved.gatedPersonName)) set.isPublic = false;
  }

  if ((set.isPublic ?? existing.isPublic) === false) {
    const blocked = await resolvePageUsageBeforeLock(db, { _id: oid }, clearPageUsages);
    if (blocked) return blocked;
  }

  const result = await db.collection("media").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const delivery = await syncMediaDelivery(db, [String(oid)]);
  const deliveryError = deliveryFailureText(delivery.failures);
  revalidateMediaSurfaces();

  const saved = await db.collection("media").findOne({ _id: oid });
  return noStoreJson({
    ok: true,
    ...(saved ? await savedAdminMedia(db, saved) : {}),
    ...(deliveryError ? { deliveryError } : {}),
  });
}

export const PATCH = withRouteErrors(patchLabels);
