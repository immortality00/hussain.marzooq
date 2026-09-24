import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { after } from "next/server";
import type { Db } from "mongodb";
import { CLOUDINARY_MANAGED_FOLDERS, CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";
import { isCloudinaryAssetReferenced } from "@/lib/server/asset-references";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import {
  deleteManagedCloudinaryFolderTree,
  isAllowedCloudinaryPublicId,
} from "@/lib/server/cloudinary-assets";
import { getDb } from "@/lib/server/db";

const COLLECTION = "upload_ledger";

export const UPLOAD_LEASE_MS = 24 * 60 * 60 * 1000;
export const SESSION_FOLDER_LEASE_MS = 3 * 60 * 60 * 1000;

const RETRY_DELAY_MS = 60 * 60 * 1000;
const CLAIM_MS = 2 * 60 * 1000;
const BATCH_SIZE = 25;
const MAX_BATCHES = 4;
const SWEEP_EVERY_MS = 5 * 60 * 1000;
const RESOURCE_TYPES = ["image", "video", "raw"] as const;

type LedgerEntry = {
  _id: string;
  kind: "asset" | "folder";
  createdAt: Date;
  expiresAt: Date;
  lockedUntil?: Date;
  attempts?: number;
};

export type DiscardResult = "deleted" | "kept" | "unknown" | "failed";

function ledger(db: Db) {
  return db.collection<LedgerEntry>(COLLECTION);
}

function folderEntryId(folder: string) {
  return `folder:${folder}`;
}

export function newUploadPublicId(folder: string) {
  return `${folder}/${randomUUID().replace(/-/g, "")}`;
}

export async function registerAssetUpload(db: Db, publicId: string, now: Date = new Date()) {
  await ledger(db).insertOne({
    _id: publicId,
    kind: "asset",
    createdAt: now,
    expiresAt: new Date(now.getTime() + UPLOAD_LEASE_MS),
  });
}

export async function registerSessionFolder(db: Db, folder: string, now: Date = new Date()) {
  await ledger(db).updateOne(
    { _id: folderEntryId(folder) },
    {
      $setOnInsert: {
        kind: "folder" as const,
        createdAt: now,
        expiresAt: new Date(now.getTime() + SESSION_FOLDER_LEASE_MS),
      },
    },
    { upsert: true }
  );
}

async function destroyAsset(publicId: string): Promise<void> {
  if (!isAllowedCloudinaryPublicId(publicId, CLOUDINARY_MANAGED_FOLDERS)) return;
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary config missing.");

  ensureCloudinaryConfigured();

  for (const resourceType of RESOURCE_TYPES) {
    const outcome = (await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "upload",
      invalidate: true,
    })) as { result?: string };

    if (outcome?.result === "ok") return;
  }
}

async function settleFolder(db: Db, folder: string): Promise<void> {
  const owner = await db
    .collection("testimonials")
    .findOne({ reviewAssetFolder: folder }, { projection: { _id: 1 } });
  if (owner) return;

  const results = await deleteManagedCloudinaryFolderTree(folder, [CLOUDINARY_TESTIMONIALS_FOLDER]);
  const failed = results.find((result) => !result.ok);
  if (failed) throw new Error(failed.error ?? "Cloudinary cleanup failed.");
}

async function settleAsset(db: Db, publicId: string): Promise<void> {
  if (await isCloudinaryAssetReferenced(db, publicId)) return;
  await destroyAsset(publicId);
}

export async function discardPendingUpload(db: Db, publicId: string): Promise<DiscardResult> {
  const entry = await ledger(db).findOne({ _id: publicId, kind: "asset" });
  if (!entry) return "unknown";

  try {
    if (await isCloudinaryAssetReferenced(db, publicId)) {
      await ledger(db).deleteOne({ _id: publicId });
      return "kept";
    }

    await destroyAsset(publicId);
  } catch (error) {
    console.error("[upload-ledger] discard failed", publicId, error);
    return "failed";
  }

  await ledger(db).deleteOne({ _id: publicId });
  return "deleted";
}

function dueFilter(now: Date) {
  return {
    expiresAt: { $lte: now },
    $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: { $lte: now } }],
  };
}

export async function sweepExpiredUploads(db: Db, now: Date = new Date()) {
  const summary = { settled: 0, failed: 0 };

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const due = await ledger(db).find(dueFilter(now)).limit(BATCH_SIZE).toArray();
    if (due.length === 0) break;

    for (const entry of due) {
      const claimed = await ledger(db).findOneAndUpdate(
        { _id: entry._id, ...dueFilter(now) },
        { $set: { lockedUntil: new Date(now.getTime() + CLAIM_MS) } }
      );
      if (!claimed) continue;

      try {
        if (entry.kind === "folder") await settleFolder(db, entry._id.slice("folder:".length));
        else await settleAsset(db, entry._id);

        await ledger(db).deleteOne({ _id: entry._id });
        summary.settled += 1;
      } catch (error) {
        console.error("[upload-ledger] sweep failed", entry._id, error);
        await ledger(db).updateOne(
          { _id: entry._id },
          {
            $set: { expiresAt: new Date(now.getTime() + RETRY_DELAY_MS) },
            $unset: { lockedUntil: "" },
            $inc: { attempts: 1 },
          }
        );
        summary.failed += 1;
      }
    }

    if (due.length < BATCH_SIZE) break;
  }

  return summary;
}

let lastSweepAt = 0;

export function resetSweepThrottleForTests() {
  lastSweepAt = 0;
}

export async function sweepIfDue(now: number = Date.now()) {
  if (now - lastSweepAt < SWEEP_EVERY_MS) return null;
  lastSweepAt = now;

  try {
    return await sweepExpiredUploads(await getDb(), new Date(now));
  } catch (error) {
    console.error("[upload-ledger] sweep aborted", error);
    return null;
  }
}

export function scheduleUploadSweep() {
  try {
    after(() => sweepIfDue());
  } catch {
    void sweepIfDue();
  }
}
