import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pipelines: Record<string, unknown[]> = {};
const fail = { db: false };

function cursor() {
  const chain = {
    sort: () => chain,
    limit: () => chain,
    project: () => chain,
    toArray: async () => [],
  };
  return chain;
}

vi.mock("@/lib/server/db", () => ({
  getDb: async () => {
    if (fail.db) throw new Error("connection refused");
    return {
      collection: (name: string) => ({
        find: () => cursor(),
        findOne: async () => null,
        countDocuments: async () => 0,
        aggregate: (pipeline: unknown[]) => {
          pipelines[name] = pipeline;
          return { toArray: async () => [] };
        },
      }),
    };
  },
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/upload-ledger", () => ({ scheduleUploadSweep: () => undefined }));

import { buildAdminSnapshot, snapshotVersion, type AdminSnapshot } from "@/lib/server/admin-snapshot";
import { GET } from "@/app/api/admin/snapshot/route";

beforeEach(() => {
  fail.db = false;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin snapshot", () => {
  it("is the same for the same data and changes with any change", () => {
    const base = { notificationCount: 1, inquiries: [{ id: "a", name: "Ada" }] } as unknown as AdminSnapshot;
    expect(snapshotVersion(base)).toBe(snapshotVersion({ ...base }));
    expect(snapshotVersion(base)).not.toBe(
      snapshotVersion({ ...base, inquiries: [{ id: "a", name: "Grace" }] } as unknown as AdminSnapshot)
    );
  });

  it("gives the same version for two builds with nothing changed, however much time passed", async () => {
    vi.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const first = snapshotVersion(await buildAdminSnapshot({ mediaCount: 60 }));
    vi.setSystemTime(new Date("2026-10-01T10:05:00Z"));
    const second = snapshotVersion(await buildAdminSnapshot({ mediaCount: 60 }));
    expect(second).toBe(first);
  });

  it("does not count archived inquiries as new or active", async () => {
    await buildAdminSnapshot({ mediaCount: 60 });
    const facet = (pipelines.inquiries?.[0] as { $facet: Record<string, [{ $match: Record<string, unknown> }]> }).$facet;
    expect(facet.new[0].$match.isArchived).toEqual({ $ne: true });
    expect(facet.active[0].$match.isArchived).toEqual({ $ne: true });
  });

  it("answers a database failure with the reason as JSON, not a bare error", async () => {
    fail.db = true;
    const res = await GET(new Request("https://hm.test/api/admin/snapshot"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toMatchObject({ ok: false });
    expect(body.error).toContain("connection refused");
  });

  it("reports how long the build took and how big the answer was", async () => {
    const res = await GET(new Request("https://hm.test/api/admin/snapshot"));
    expect(res.headers.get("server-timing")).toMatch(/^build;dur=\d+, size;desc="\d+"$/);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
