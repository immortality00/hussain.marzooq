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
}) {
  const { bucket, limit, windowMs } = params;
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
            $cond: ["$expired", 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }],
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

  const count = typeof result?.count === "number" ? result.count : 1;
  const resetAt =
    result?.resetAt instanceof Date ? result.resetAt.toISOString() : nextReset.toISOString();

  return {
    limited: count > limit,
    count,
    resetAt,
  };
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