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
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";

beforeEach(() => {
  findOne.mockReset();
  findOneAndUpdate.mockReset();
  deleteOne.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getFixedWindowRateLimitStatus", () => {
  const future = () => new Date(Date.now() + 60_000);

  test("not limited at exactly the limit, limited only above it", async () => {
    findOne.mockResolvedValueOnce({ count: 5, resetAt: future() });
    expect((await getFixedWindowRateLimitStatus({ bucket: "b", key: "k", limit: 5 })).limited).toBe(
      false
    );

    findOne.mockResolvedValueOnce({ count: 6, resetAt: future() });
    expect((await getFixedWindowRateLimitStatus({ bucket: "b", key: "k", limit: 5 })).limited).toBe(
      true
    );
  });

  test("absent or expired window is never limited", async () => {
    findOne.mockResolvedValueOnce(null);
    expect((await getFixedWindowRateLimitStatus({ bucket: "b", key: "k", limit: 5 })).limited).toBe(
      false
    );

    findOne.mockResolvedValueOnce({ count: 99, resetAt: new Date(Date.now() - 1000) });
    const expired = await getFixedWindowRateLimitStatus({ bucket: "b", key: "k", limit: 5 });
    expect(expired.limited).toBe(false);
    expect(expired.count).toBe(0);
  });
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
