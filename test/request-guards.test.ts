import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const findOne = vi.fn();
const findOneAndUpdate = vi.fn();
const deleteOne = vi.fn();

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(async () => ({
    collection: () => ({ findOne, findOneAndUpdate, deleteOne }),
  })),
}));

import {
  claimDuplicateWindow,
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
  storedGuardKey,
} from "@/lib/server/request-guards";

beforeEach(() => {
  findOne.mockReset();
  findOneAndUpdate.mockReset();
  deleteOne.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("consumeFixedWindowRateLimit", () => {
  const future = () => new Date(Date.now() + 60_000);

  test("reports limited only once the count exceeds the limit", async () => {
    findOneAndUpdate.mockResolvedValueOnce({ count: 5, resetAt: future() });
    const atLimit = await consumeFixedWindowRateLimit({
      bucket: "b",
      key: "k",
      limit: 5,
      windowMs: 60_000,
    });
    expect(atLimit.limited).toBe(false);

    findOneAndUpdate.mockResolvedValueOnce({ count: 6, resetAt: future() });
    const overLimit = await consumeFixedWindowRateLimit({
      bucket: "b",
      key: "k",
      limit: 5,
      windowMs: 60_000,
    });
    expect(overLimit.limited).toBe(true);
  });
});

describe("claimDuplicateWindow", () => {
  test("claims atomically with a single findOneAndUpdate and no read-first", async () => {
    findOneAndUpdate.mockResolvedValueOnce(null);
    const first = await claimDuplicateWindow({ bucket: "b", key: "k", windowMs: 60_000 });

    expect(first.duplicated).toBe(false);
    expect(findOne).not.toHaveBeenCalled();
    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
    const [, , options] = findOneAndUpdate.mock.calls[0];
    expect(options).toMatchObject({ upsert: true, returnDocument: "before" });
  });

  test("a live prior window is a duplicate and its expiry is preserved", async () => {
    const priorExpiry = new Date(Date.now() + 30_000);
    findOneAndUpdate.mockResolvedValueOnce({ expiresAt: priorExpiry });

    const result = await claimDuplicateWindow({ bucket: "b", key: "k", windowMs: 60_000 });

    expect(result.duplicated).toBe(true);
    expect(result.expiresAt).toBe(priorExpiry.toISOString());
  });

  test("an expired prior window is reclaimed, not a duplicate", async () => {
    findOneAndUpdate.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000) });

    const result = await claimDuplicateWindow({ bucket: "b", key: "k", windowMs: 60_000 });

    expect(result.duplicated).toBe(false);
  });
});

describe("stored keys", () => {
  const long = "a".repeat(200);
  const hashed = storedGuardKey(long);

  test("a key over 128 characters is stored as its sha256 hex; a short one is unchanged", () => {
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
    expect(storedGuardKey(long)).toBe(hashed);
    expect(storedGuardKey("a".repeat(128))).toBe("a".repeat(128));
    expect(storedGuardKey("gallery:203.0.113.9")).toBe("gallery:203.0.113.9");
  });

  test("consume, clear and dedupe all write the hashed key, never the long one", async () => {
    findOneAndUpdate.mockResolvedValue(null);
    await consumeFixedWindowRateLimit({ bucket: "b", key: long, limit: 5, windowMs: 60_000 });
    await clearFixedWindowRateLimit({ bucket: "b", key: long });
    await claimDuplicateWindow({ bucket: "b", key: long, windowMs: 60_000 });

    const [rateFilter, ratePipeline] = findOneAndUpdate.mock.calls[0];
    expect(rateFilter).toEqual({ _id: `rate:b:${hashed}` });
    expect(JSON.stringify(ratePipeline)).not.toContain(long);
    expect(deleteOne).toHaveBeenCalledWith({ _id: `rate:b:${hashed}` });

    const [dedupeFilter, dedupePipeline] = findOneAndUpdate.mock.calls[1];
    expect(dedupeFilter).toEqual({ _id: `dedupe:b:${hashed}` });
    expect(JSON.stringify(dedupePipeline)).not.toContain(long);
  });
});
