import { after } from "next/server";
import type { Db } from "mongodb";
import { getDb } from "@/lib/server/db";
import { isBuildPhase } from "@/lib/server/public-read";
import { discardUnsavedPoster, storeVideoPoster } from "@/lib/server/video-posters";
import { warmImageSizes } from "@/lib/server/cloudinary-warm";
import { parseVideoLink } from "@/lib/video-embed";

/**
 * A video link saved before YouTube has a thumbnail — a video scheduled to go
 * public later — gets no poster (MO3, 2026-11-10: 12 scheduled SalsaNama videos
 * saved 27 Oct had none, three already live). It used to be retried only when the
 * item was saved again. Now any public page render or admin data check retries a
 * few, in the background, until YouTube has one.
 */
const RUN_EVERY_MS = 10 * 60_000;
const ITEM_EVERY_MS = 30 * 60_000;
const PER_RUN = 3;

let lastRun = 0;
let reportedFailure = false;

const MISSING_POSTER = {
  type: "embed",
  isPublic: { $ne: false },
  embedUrl: { $type: "string" },
  $or: [{ posterUrl: { $exists: false } }, { posterUrl: null }, { posterUrl: "" }],
};

/** Retries up to `PER_RUN` video links without a poster; returns how many got one. */
export async function retryMissingPosters(db: Db, now = new Date()): Promise<number> {
  const due = await db
    .collection("media")
    .find({
      ...MISSING_POSTER,
      $and: [
        {
          $or: [
            { posterTriedAt: { $exists: false } },
            { posterTriedAt: null },
            { posterTriedAt: { $lt: new Date(now.getTime() - ITEM_EVERY_MS) } },
          ],
        },
      ],
    })
    .sort({ publishAt: 1, _id: 1 })
    .limit(PER_RUN)
    .toArray();

  let stored = 0;
  for (const doc of due) {
    // Recorded first, so a failing video is not retried on every run.
    await db.collection("media").updateOne({ _id: doc._id }, { $set: { posterTriedAt: now } });

    const ref = typeof doc.embedUrl === "string" ? parseVideoLink(doc.embedUrl) : null;
    const poster = ref ? await storeVideoPoster(db, ref) : null;
    if (!poster) continue;

    const written = await db
      .collection("media")
      .updateOne(
        { _id: doc._id, $or: MISSING_POSTER.$or },
        { $set: { posterUrl: poster.url, posterPublicId: poster.publicId }, $unset: { posterTriedAt: "" } },
      );
    if (written.matchedCount === 0) {
      await discardUnsavedPoster(db, poster.publicId);
      continue;
    }
    stored += 1;
    await warmImageSizes(poster.url).catch(() => {});
  }
  return stored;
}

async function runIfDue() {
  const now = Date.now();
  if (now - lastRun < RUN_EVERY_MS) return;
  lastRun = now;
  try {
    const stored = await retryMissingPosters(await getDb(), new Date(now));
    if (stored) console.info(`[video-posters] ${stored} missing poster(s) stored`);
    reportedFailure = false;
  } catch (error) {
    if (!reportedFailure) console.error("[video-posters] retry failed", error);
    reportedFailure = true;
  }
}

/** Schedules a retry after the response, at most every 10 minutes per server instance. */
export function scheduleMissingPosterRetry() {
  if (isBuildPhase() || process.env.NODE_ENV === "test" || Date.now() - lastRun < RUN_EVERY_MS) return;
  try {
    after(() => runIfDue());
  } catch {
    void runIfDue();
  }
}
