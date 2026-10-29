import { createHash } from "node:crypto";
import { getDb } from "@/lib/server/db";

type GuardDoc = {
  _id: string;
  type: "rate-limit" | "dedupe";
  bucket: string;
  key: string;
  count?: number;
  resetAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_STORED_KEY_LENGTH = 128;

export function storedGuardKey(key: string) {
  return key.length > MAX_STORED_KEY_LENGTH ? createHash("sha256").update(key).digest("hex") : key;
}

function buildRateLimitId(bucket: string, key: string) {
  return `rate:${bucket}:${key}`;
}

async function getRequestGuardsCollection() {
  const db = await getDb();
  return db.collection<GuardDoc>("request_guards");
}

export async function consumeFixedWindowRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
  amount?: number;
}) {
  const { bucket, limit, windowMs } = params;
  const amount = Number.isFinite(params.amount) ? Math.max(1, Math.floor(params.amount as number)) : 1;
  const key = storedGuardKey(params.key);
  const collection = await getRequestGuardsCollection();

  const now = new Date();
  const nowMs = now.getTime();
  const nextReset = new Date(nowMs + windowMs);
  const id = buildRateLimitId(bucket, key);

  const result = await collection.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          expired: {
            $or: [{ $not: ["$resetAt"] }, { $lte: ["$resetAt", now] }],
          },
        },
      },
      {
        $set: {
          _id: id,
          type: "rate-limit",
          bucket,
          key,
          count: {
            $cond: ["$expired", amount, { $add: [{ $ifNull: ["$count", 0] }, amount] }],
          },
          resetAt: {
            $cond: ["$expired", nextReset, "$resetAt"],
          },
          expiresAt: {
            $cond: ["$expired", nextReset, "$resetAt"],
          },
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
      { $unset: "expired" },
    ],
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  const count = typeof result?.count === "number" ? result.count : amount;
  const resetAt =
    result?.resetAt instanceof Date ? result.resetAt.toISOString() : nextReset.toISOString();

  return {
    limited: count > limit,
    count,
    resetAt,
  };
}

// For showing a visitor that a limit is used up. Never gate on it: a gate consumes first
// (consumeFixedWindowRateLimit) and checks the count it returns.
export async function fixedWindowCount(params: { bucket: string; key: string }) {
  const collection = await getRequestGuardsCollection();
  const doc = await collection.findOne({ _id: buildRateLimitId(params.bucket, storedGuardKey(params.key)) });
  const live = doc?.resetAt instanceof Date && doc.resetAt.getTime() > Date.now();
  return live && typeof doc?.count === "number" ? doc.count : 0;
}

export async function clearFixedWindowRateLimit(params: { bucket: string; key: string }) {
  const { bucket } = params;
  const key = storedGuardKey(params.key);
  const collection = await getRequestGuardsCollection();
  const id = buildRateLimitId(bucket, key);

  await collection.deleteOne({ _id: id });
}

export async function claimDuplicateWindow(params: {
  bucket: string;
  key: string;
  windowMs: number;
}) {
  const { bucket, windowMs } = params;
  const key = storedGuardKey(params.key);
  const collection = await getRequestGuardsCollection();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const id = `dedupe:${bucket}:${key}`;

  const previous = await collection.findOneAndUpdate(
    { _id: id },
    [
      { $set: { live: { $gt: ["$expiresAt", now] } } },
      {
        $set: {
          type: "dedupe",
          bucket,
          key,
          expiresAt: { $cond: ["$live", "$expiresAt", expiresAt] },
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
      { $unset: "live" },
    ],
    { upsert: true, returnDocument: "before" }
  );

  const wasLive =
    !!previous &&
    previous.expiresAt instanceof Date &&
    previous.expiresAt.getTime() > now.getTime();

  const effectiveExpiry = wasLive ? (previous.expiresAt as Date) : expiresAt;

  return {
    duplicated: wasLive,
    expiresAt: effectiveExpiry.toISOString(),
  };
}

/** Ends a duplicate window early, so a request that failed after claiming it can be sent again. */
export async function releaseDuplicateWindow(params: { bucket: string; key: string }) {
  const collection = await getRequestGuardsCollection();
  await collection.deleteOne({ _id: `dedupe:${params.bucket}:${storedGuardKey(params.key)}` });
}
