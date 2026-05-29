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

let indexesReady = false;

async function ensureIndexes() {
  if (indexesReady) return;

  const db = await getDb();
  const collection = db.collection<GuardDoc>("request_guards");

  await collection.createIndexes([
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    { key: { bucket: 1, type: 1, updatedAt: -1 } },
  ]);

  indexesReady = true;
}

export async function consumeFixedWindowRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  await ensureIndexes();

  const { bucket, key, limit, windowMs } = params;
  const db = await getDb();
  const collection = db.collection<GuardDoc>("request_guards");

  const now = new Date();
  const nowMs = now.getTime();
  const nextReset = new Date(nowMs + windowMs);
  const id = `rate:${bucket}:${key}`;

  const result = await collection.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          expired: {
            $or: [
              { $not: ["$resetAt"] },
              { $lte: ["$resetAt", now] },
            ],
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
            $cond: [
              "$expired",
              1,
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
            ],
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

export async function claimDuplicateWindow(params: {
  bucket: string;
  key: string;
  windowMs: number;
}) {
  await ensureIndexes();

  const { bucket, key, windowMs } = params;
  const db = await getDb();
  const collection = db.collection<GuardDoc>("request_guards");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const id = `dedupe:${bucket}:${key}`;

  const existing = await collection.findOne({ _id: id });

  if (existing && existing.expiresAt instanceof Date && existing.expiresAt.getTime() > now.getTime()) {
    return {
      duplicated: true,
      expiresAt: existing.expiresAt.toISOString(),
    };
  }

  await collection.updateOne(
    { _id: id },
    {
      $set: {
        _id: id,
        type: "dedupe",
        bucket,
        key,
        expiresAt,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  return {
    duplicated: false,
    expiresAt: expiresAt.toISOString(),
  };
}