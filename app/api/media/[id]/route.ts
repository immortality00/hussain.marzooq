import { revalidateMediaSurfaces, revalidateSitePages } from "@/app/api/_lib/revalidate";
import { savedAdminMedia, serializeAdminMediaItem } from "@/lib/server/admin-media";
import { mediaInUseResponse, usageUpdateFailedResponse } from "@/app/api/_lib/media-usage";
import { getDb } from "@/lib/server/db";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { asStringArray, noStoreJson } from "@/app/api/_lib/common";
import { duplicateVideoMessage, findMediaWithVideo } from "@/app/api/_lib/media";
import { deleteVideoPoster } from "@/lib/server/video-posters";
import { deleteStoredMediaAsset, getStoredMediaAsset } from "@/lib/server/media-asset-management";
import {
  findPrivateGalleriesUsingMedia,
  formatPrivateGalleryMediaDeleteBlocker,
} from "@/lib/server/private-gallery-admin";
import { changedSinceOpened, recordChangedResponse } from "@/app/api/_lib/record-version";
import { findMediaUsageConflicts, removeMediaUsages } from "@/lib/server/media-usage";
import { parseMediaPatch } from "./_lib/parse-media-patch";
import { buildMediaSet } from "./_lib/media-set";
import { checkPageUsage, finishFileChange } from "./_lib/media-page-usage";
import { applyAssetChange } from "./_lib/media-asset-change";
import { writeMediaChange } from "./_lib/media-write";
import { scheduleOnUpdate } from "@/lib/media-schedule";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "media", oid);
  if (found instanceof Response) return found;
  const { doc } = found;

  const item = await serializeAdminMediaItem(db, doc);

  return noStoreJson({ ok: true, item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const parsed = parseMediaPatch(await req.json().catch(() => null));
  if (!parsed.ok) return parsed.response;
  const { input } = parsed;

  const db = await getDb();
  const existingFound = await findByIdOr404(db, "media", oid);
  if (existingFound instanceof Response) return existingFound;
  const existingMedia = existingFound.doc;
  if (changedSinceOpened(req, existingMedia)) return recordChangedResponse(await savedAdminMedia(db, existingMedia));

  const schedule = scheduleOnUpdate(input.publishAt, existingMedia.publishAt, new Date());
  if (!schedule.ok) return noStoreJson({ ok: false, error: schedule.error }, { status: 400 });

  const oldAsset = getStoredMediaAsset(existingMedia);
  const set = { ...(await buildMediaSet(db, oid, input)), ...schedule.set };

  if (input.video) {
    const duplicate = await findMediaWithVideo(db, input.video, oid);
    if (duplicate) {
      return noStoreJson({ ok: false, error: duplicateVideoMessage(duplicate) }, { status: 409 });
    }
  }

  const usage = await checkPageUsage(db, existingMedia, oldAsset, input);
  if (usage instanceof Response) return usage;

  const change = await applyAssetChange(db, set, existingMedia, oldAsset, input);
  if (change instanceof Response) return change;

  const notWritten = await writeMediaChange(db, oid, set, change, oldAsset, existingMedia.posterPublicId);
  if (notWritten) return notWritten;

  const { pageEdit, pagesNotUpdated } = await finishFileChange(db, usage, input, set, oldAsset, change);

  revalidateMediaSurfaces([...input.tags, ...asStringArray(existingMedia.tags)]);
  if (pageEdit) revalidateSitePages();

  const saved = await db.collection("media").findOne({ _id: oid });

  return noStoreJson({
    ok: true,
    ...(saved ? await savedAdminMedia(db, saved) : {}),
    ...(change.posterMissing ? { posterMissing: true } : {}),
    ...(pagesNotUpdated.length ? { pagesNotUpdated } : {}),
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "media", oid);
  if (found instanceof Response) return found;
  const media = found.doc;

  const mediaAsset = getStoredMediaAsset(media);
  const galleryDocs = await findPrivateGalleriesUsingMedia(db, String(oid));

  if (galleryDocs.length > 0) {
    return noStoreJson(
      {
        ok: false,
        error: formatPrivateGalleryMediaDeleteBlocker(galleryDocs),
      },
      { status: 409 }
    );
  }

  const [inUse] = await findMediaUsageConflicts(db, [media]);
  if (inUse) {
    if (new URL(req.url).searchParams.get("detach") !== "1") return mediaInUseResponse([inUse]);

    const failed = await removeMediaUsages(db, [inUse]);
    revalidateSitePages();
    if (failed.length) return usageUpdateFailedResponse(failed, "Nothing was deleted.");

    const [stillInUse] = await findMediaUsageConflicts(db, [media]);
    if (stillInUse) return mediaInUseResponse([stillInUse]);
  }

  const result = await db.collection("media").deleteOne({ _id: oid });
  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Delete failed" }, { status: 500 });
  }

  await deleteStoredMediaAsset(mediaAsset);
  await deleteVideoPoster(media.posterPublicId);

  revalidateMediaSurfaces(asStringArray(media.tags));

  return noStoreJson({ ok: true });
}