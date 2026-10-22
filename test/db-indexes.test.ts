import { describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";
import { DB_INDEXES, ensureIndexes } from "@/lib/server/db-indexes";
import { isProductionDeploy } from "@/lib/server/deploy-indexes";

type Index = { name: string; key: Record<string, number>; options: Record<string, unknown> };

function fakeDb({ conflictOn, duplicatesIn }: { conflictOn?: string; duplicatesIn?: string } = {}) {
  const indexes = new Map<string, Index[]>();
  const dropped: string[] = [];
  const batches: string[] = [];
  const db = {
    collection: (name: string) => {
      const list = () => indexes.get(name) ?? indexes.set(name, []).get(name)!;
      const nameOf = (key: Record<string, number>) => Object.entries(key).map(([k, v]) => `${k}_${v}`).join("_");
      const conflicts = (key: Record<string, number>, options: Record<string, unknown>) => {
        const existing = list().find((index) => index.name === nameOf(key));
        return Boolean(existing && JSON.stringify(existing.options) !== JSON.stringify(options));
      };
      const create = (key: Record<string, number>, options: Record<string, unknown>) => {
        if (conflicts(key, options)) throw Object.assign(new Error("conflict"), { codeName: "IndexOptionsConflict" });
        if (!list().some((index) => index.name === nameOf(key))) list().push({ name: nameOf(key), key, options });
        return nameOf(key);
      };
      return {
        createIndex: vi.fn(async (key: Record<string, number>, options: Record<string, unknown>) => create(key, options)),
        createIndexes: vi.fn(async (specs: { key: Record<string, number> }[]) => {
          const conflict = specs.some(({ key, ...options }) => conflicts(key, options));
          if (conflict) throw Object.assign(new Error("conflict"), { codeName: "IndexOptionsConflict" });
          batches.push(name);
          return specs.map(({ key, ...options }) => create(key, options));
        }),
        indexes: async () => list(),
        dropIndex: async (indexName: string) => {
          dropped.push(`${name}.${indexName}`);
          indexes.set(name, list().filter((index) => index.name !== indexName));
        },
        aggregate: () => ({
          toArray: async () => (name === "media" && duplicatesIn ? [{ _id: "dup", count: 2 }] : []),
        }),
      };
    },
  };
  if (conflictOn) indexes.set("media", [{ name: conflictOn, key: { publicId: 1 }, options: { sparse: true } }]);
  return { db: db as unknown as Db, indexes, dropped, batches };
}

describe("ensureIndexes", () => {
  it("creates every index in the list, one request per collection, and running it again changes nothing", async () => {
    const { db, indexes, batches } = fakeDb();
    expect(await ensureIndexes(db)).toEqual({ total: DB_INDEXES.length, recreated: [] });
    const count = [...indexes.values()].flat().length;
    expect(count).toBe(DB_INDEXES.length);
    expect(batches).toEqual([...new Set(DB_INDEXES.map((rule) => rule.collection))]);
    expect(await ensureIndexes(db)).toEqual({ total: DB_INDEXES.length, recreated: [] });
    expect([...indexes.values()].flat().length).toBe(count);
  });

  it("rebuilds only a same-key index whose options changed", async () => {
    const { db, dropped } = fakeDb({ conflictOn: "publicId_1" });
    const result = await ensureIndexes(db);
    expect(result.recreated).toEqual(["media.publicId_1"]);
    expect(dropped).toEqual(["media.publicId_1"]);
  });

  it("refuses a unique index over duplicate values, naming them", async () => {
    await expect(ensureIndexes(fakeDb({ duplicatesIn: "publicId" }).db)).rejects.toThrow(/duplicate values.*dup \(2\)/);
  });

  it("covers the passkey collections", () => {
    expect(DB_INDEXES).toContainEqual({ collection: "admin_passkeys", keys: { credentialId: 1 }, options: { unique: true } });
    expect(DB_INDEXES).toContainEqual(
      expect.objectContaining({ collection: "admin_auth_requests", options: { expireAfterSeconds: 0 } })
    );
  });
});

describe("isProductionDeploy", () => {
  it("skips previews and branch deploys, and runs for production or an unknown context", () => {
    expect(isProductionDeploy({ context: "production" })).toBe(true);
    expect(isProductionDeploy({ context: "deploy-preview" })).toBe(false);
    expect(isProductionDeploy({ context: "branch-deploy" })).toBe(false);
    expect(isProductionDeploy({})).toBe(true);
    expect(isProductionDeploy(null)).toBe(true);
  });
});
