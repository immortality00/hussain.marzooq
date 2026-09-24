import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Db } from "mongodb";

const { destroy, folderTree, referenced, getDb, afterFn } = vi.hoisted(() => ({
  destroy: vi.fn(),
  folderTree: vi.fn(),
  referenced: vi.fn(),
  getDb: vi.fn(),
  afterFn: vi.fn(),
}));

vi.mock("cloudinary", () => ({ v2: { uploader: { destroy } } }));
vi.mock("next/server", () => ({ after: afterFn }));
vi.mock("@/lib/server/db", () => ({ getDb }));
vi.mock("@/lib/server/asset-references", () => ({ isCloudinaryAssetReferenced: referenced }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => true,
  ensureCloudinaryConfigured: () => ({}),
}));
vi.mock("@/lib/server/cloudinary-assets", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/cloudinary-assets")>(
    "@/lib/server/cloudinary-assets"
  );
  return { ...actual, deleteManagedCloudinaryFolderTree: folderTree };
});

import {
  UPLOAD_LEASE_MS,
  discardPendingUpload,
  newUploadPublicId,
  registerAssetUpload,
  registerSessionFolder,
  resetSweepThrottleForTests,
  scheduleUploadSweep,
  sweepExpiredUploads,
  sweepIfDue,
} from "@/lib/server/upload-ledger";

type Doc = Record<string, unknown> & { _id?: string };

function matches(doc: Doc, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    if (key === "$or") return (cond as Record<string, unknown>[]).some((f) => matches(doc, f));
    const value = doc[key];
    if (cond && typeof cond === "object" && !(cond instanceof Date)) {
      const c = cond as Record<string, unknown>;
      if ("$lte" in c) return value instanceof Date && value.getTime() <= (c.$lte as Date).getTime();
      if ("$exists" in c) return (value !== undefined) === c.$exists;
    }
    return value === cond;
  });
}

function applyUpdate(doc: Doc, update: Record<string, Record<string, unknown>>, inserting: boolean) {
  Object.assign(doc, update.$set ?? {});
  if (inserting) Object.assign(doc, update.$setOnInsert ?? {});
  for (const key of Object.keys(update.$unset ?? {})) delete doc[key];
  for (const [key, by] of Object.entries(update.$inc ?? {})) doc[key] = ((doc[key] as number) ?? 0) + (by as number);
}

function makeDb(seed: Record<string, Doc[]> = {}) {
  const stores: Record<string, Map<string, Doc>> = {};
  const store = (name: string) => (stores[name] ??= new Map());
  for (const [name, docs] of Object.entries(seed)) docs.forEach((d, i) => store(name).set(String(d._id ?? i), { ...d }));

  const db = {
    collection(name: string) {
      const s = store(name);
      return {
        insertOne: async (doc: Doc) => void s.set(String(doc._id), { ...doc }),
        findOne: async (filter: Record<string, unknown>) =>
          [...s.values()].find((d) => matches(d, filter)) ?? null,
        deleteOne: async (filter: Record<string, unknown>) => {
          const hit = [...s.entries()].find(([, d]) => matches(d, filter));
          if (hit) s.delete(hit[0]);
        },
        find: (filter: Record<string, unknown>) => ({
          limit: (n: number) => ({ toArray: async () => [...s.values()].filter((d) => matches(d, filter)).slice(0, n) }),
        }),
        findOneAndUpdate: async (filter: Record<string, unknown>, update: Record<string, Record<string, unknown>>) => {
          const hit = [...s.values()].find((d) => matches(d, filter));
          if (!hit) return null;
          const before = { ...hit };
          applyUpdate(hit, update, false);
          return before;
        },
        updateOne: async (
          filter: Record<string, unknown>,
          update: Record<string, Record<string, unknown>>,
          options?: { upsert?: boolean }
        ) => {
          let hit = [...s.values()].find((d) => matches(d, filter));
          const inserting = !hit && Boolean(options?.upsert);
          if (!hit && options?.upsert) {
            hit = { _id: filter._id as string };
            s.set(String(hit._id), hit);
          }
          if (hit) applyUpdate(hit, update, inserting);
        },
      };
    },
  } as unknown as Db;

  return { db, ledger: () => store("upload_ledger") };
}

const FOLDER = "hm_visuals/media/photography";
const ID = `${FOLDER}/abc`;
const NOW = new Date("2026-09-24T12:00:00Z");
const PAST = new Date(NOW.getTime() - 1000);
const FUTURE = new Date(NOW.getTime() + 60_000);

beforeEach(() => {
  vi.clearAllMocks();
  resetSweepThrottleForTests();
  destroy.mockResolvedValue({ result: "ok" });
  referenced.mockResolvedValue(false);
  folderTree.mockResolvedValue([{ ok: true, target: "x", action: "delete-asset" }]);
});

describe("issuing", () => {
  test("a server-chosen id inside the requested folder", () => {
    expect(newUploadPublicId(FOLDER)).toMatch(/^hm_visuals\/media\/photography\/[0-9a-f]{32}$/);
    expect(newUploadPublicId(FOLDER)).not.toBe(newUploadPublicId(FOLDER));
  });

  test("registering records the asset with a 24h lease", async () => {
    const { db, ledger } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    const entry = ledger().get(ID)!;
    expect(entry.kind).toBe("asset");
    expect((entry.expiresAt as Date).getTime() - NOW.getTime()).toBe(UPLOAD_LEASE_MS);
  });

  test("registering a session folder twice keeps the first lease", async () => {
    const { db, ledger } = makeDb();
    await registerSessionFolder(db, "hm_visuals/testimonials/s1", NOW);
    await registerSessionFolder(db, "hm_visuals/testimonials/s1", new Date(NOW.getTime() + 999_999));
    expect(ledger().size).toBe(1);
    expect(ledger().get("folder:hm_visuals/testimonials/s1")!.createdAt).toEqual(NOW);
  });
});

describe("discardPendingUpload", () => {
  test("an id the server never issued is untouchable", async () => {
    const { db } = makeDb();
    expect(await discardPendingUpload(db, ID)).toBe("unknown");
    expect(destroy).not.toHaveBeenCalled();
  });

  test("a pending, unreferenced upload is destroyed and dropped from the ledger", async () => {
    const { db, ledger } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    expect(await discardPendingUpload(db, ID)).toBe("deleted");
    expect(destroy).toHaveBeenCalledWith(ID, expect.objectContaining({ resource_type: "image", type: "upload" }));
    expect(ledger().has(ID)).toBe(false);
  });

  test("an upload a saved document already uses is kept, and only the ledger entry goes", async () => {
    const { db, ledger } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    referenced.mockResolvedValue(true);
    expect(await discardPendingUpload(db, ID)).toBe("kept");
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().has(ID)).toBe(false);
  });

  test("a reference-check failure never guesses: nothing destroyed, entry retained for retry", async () => {
    const { db, ledger } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    referenced.mockRejectedValue(new Error("db down"));
    expect(await discardPendingUpload(db, ID)).toBe("failed");
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().has(ID)).toBe(true);
  });

  test("a Cloudinary error keeps the entry so the sweep retries", async () => {
    const { db, ledger } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    destroy.mockRejectedValue(new Error("cloudinary down"));
    expect(await discardPendingUpload(db, ID)).toBe("failed");
    expect(ledger().has(ID)).toBe(true);
  });

  test("tries image, then video, then raw until one reports ok", async () => {
    const { db } = makeDb();
    await registerAssetUpload(db, ID, NOW);
    destroy.mockResolvedValueOnce({ result: "not found" }).mockResolvedValueOnce({ result: "ok" });
    await discardPendingUpload(db, ID);
    expect(destroy.mock.calls.map(([, o]) => o.resource_type)).toEqual(["image", "video"]);
  });
});

describe("sweepExpiredUploads", () => {
  test("leaves entries that have not expired alone", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: FUTURE }] });
    await sweepExpiredUploads(db, NOW);
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().has(ID)).toBe(true);
  });

  test("an expired, unreferenced upload is destroyed and removed", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST }] });
    expect(await sweepExpiredUploads(db, NOW)).toEqual({ settled: 1, failed: 0 });
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(ledger().size).toBe(0);
  });

  test("an expired upload that a document now owns is released, never destroyed", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST }] });
    referenced.mockResolvedValue(true);
    await sweepExpiredUploads(db, NOW);
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().size).toBe(0);
  });

  test("an upload that was signed but never used settles quietly ('not found' everywhere)", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST }] });
    destroy.mockResolvedValue({ result: "not found" });
    expect(await sweepExpiredUploads(db, NOW)).toEqual({ settled: 1, failed: 0 });
    expect(ledger().size).toBe(0);
  });

  test("a failure is retried later: pushed back an hour, unlocked, attempts counted", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST }] });
    destroy.mockRejectedValue(new Error("cloudinary down"));
    expect(await sweepExpiredUploads(db, NOW)).toEqual({ settled: 0, failed: 1 });
    const entry = ledger().get(ID)!;
    expect(entry.attempts).toBe(1);
    expect(entry.lockedUntil).toBeUndefined();
    expect((entry.expiresAt as Date).getTime()).toBe(NOW.getTime() + 60 * 60 * 1000);
  });

  test("a database error during the reference check retries instead of dropping the entry", async () => {
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST }] });
    referenced.mockRejectedValue(new Error("db down"));
    await sweepExpiredUploads(db, NOW);
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().get(ID)!.attempts).toBe(1);
  });

  test("an entry another worker holds is skipped", async () => {
    const { db, ledger } = makeDb({
      upload_ledger: [{ _id: ID, kind: "asset", expiresAt: PAST, lockedUntil: FUTURE }],
    });
    await sweepExpiredUploads(db, NOW);
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().has(ID)).toBe(true);
  });

  test("an id outside the managed folders is never sent to Cloudinary", async () => {
    const { db, ledger } = makeDb({
      upload_ledger: [{ _id: "someone_elses/asset", kind: "asset", expiresAt: PAST }],
    });
    await sweepExpiredUploads(db, NOW);
    expect(destroy).not.toHaveBeenCalled();
    expect(ledger().size).toBe(0);
  });

  test("an expired review-session folder that a saved review owns is kept", async () => {
    const folder = "hm_visuals/testimonials/s1";
    const { db, ledger } = makeDb({
      upload_ledger: [{ _id: `folder:${folder}`, kind: "folder", expiresAt: PAST }],
      testimonials: [{ _id: "t1", reviewAssetFolder: folder }],
    });
    await sweepExpiredUploads(db, NOW);
    expect(folderTree).not.toHaveBeenCalled();
    expect(ledger().size).toBe(0);
  });

  test("an expired review-session folder nobody owns is deleted, even after Mongo's TTL removed the session", async () => {
    const folder = "hm_visuals/testimonials/s2";
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: `folder:${folder}`, kind: "folder", expiresAt: PAST }] });
    await sweepExpiredUploads(db, NOW);
    expect(folderTree).toHaveBeenCalledWith(folder, ["hm_visuals/testimonials"]);
    expect(ledger().size).toBe(0);
  });

  test("a folder that fails to delete is retried", async () => {
    const folder = "hm_visuals/testimonials/s3";
    const { db, ledger } = makeDb({ upload_ledger: [{ _id: `folder:${folder}`, kind: "folder", expiresAt: PAST }] });
    folderTree.mockResolvedValue([{ ok: false, target: folder, action: "delete-asset", error: "boom" }]);
    expect(await sweepExpiredUploads(db, NOW)).toEqual({ settled: 0, failed: 1 });
    expect(ledger().get(`folder:${folder}`)!.attempts).toBe(1);
  });
});

describe("triggering", () => {
  test("the automatic sweep runs at most once per five minutes", async () => {
    const { db } = makeDb();
    getDb.mockResolvedValue(db);
    const t = NOW.getTime();
    expect(await sweepIfDue(t)).toEqual({ settled: 0, failed: 0 });
    expect(await sweepIfDue(t + 60_000)).toBeNull();
    expect(await sweepIfDue(t + 6 * 60_000)).toEqual({ settled: 0, failed: 0 });
  });

  test("a sweep that cannot reach the database is swallowed, never thrown into a request", async () => {
    getDb.mockRejectedValue(new Error("no db"));
    await expect(sweepIfDue(NOW.getTime())).resolves.toBeNull();
  });

  test("scheduling hands the sweep to Next's after()", () => {
    scheduleUploadSweep();
    expect(afterFn).toHaveBeenCalledTimes(1);
  });

  test("outside a request scope it still sweeps instead of throwing", async () => {
    const { db } = makeDb();
    getDb.mockResolvedValue(db);
    afterFn.mockImplementation(() => {
      throw new Error("outside request scope");
    });
    expect(() => scheduleUploadSweep()).not.toThrow();
    await vi.waitFor(() => expect(getDb).toHaveBeenCalled());
  });
});
