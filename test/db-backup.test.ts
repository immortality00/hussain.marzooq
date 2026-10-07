import { describe, expect, test } from "vitest";
import { ObjectId, type Db } from "mongodb";
import {
  backupCounts,
  backupKey,
  decodeBackup,
  encodeBackup,
  expiredBackupKeys,
  exportDatabase,
  latestBackupKey,
} from "@/lib/server/db-backup";

const savedAt = new Date("2026-10-01T09:00:00.000Z");
const mediaId = new ObjectId();

const fakeDb = {
  databaseName: "hm_visuals",
  listCollections: () => ({
    toArray: async () => ["media", "testimonial_locations", "request_guards", "system.views", "inquiries"].map((name) => ({ name })),
  }),
  collection: (name: string) => ({
    find: () => ({
      toArray: async () => (name === "media" ? [{ _id: mediaId, title: "Frame", createdAt: savedAt }] : [{ _id: new ObjectId(), email: "a@b.co" }]),
    }),
    listIndexes: () => ({
      toArray: async () => [
        { v: 2, key: { _id: 1 }, name: "_id_" },
        { v: 2, key: { createdAt: -1 }, name: "createdAt_-1", ns: "hm_visuals.media" },
      ],
    }),
  }),
} as unknown as Db;

describe("database backup", () => {
  test("exports every collection except the rebuildable ones, with indexes", async () => {
    const backup = await exportDatabase(fakeDb, savedAt);
    expect(Object.keys(backup.collections)).toEqual(["inquiries", "media"]);
    expect(backup.collections.media!.indexes).toEqual([{ key: { createdAt: -1 }, name: "createdAt_-1" }]);
    expect(backupCounts(backup)).toEqual({ inquiries: 1, media: 1 });
  });

  test("round-trips ids and dates exactly", async () => {
    const restored = decodeBackup(encodeBackup(await exportDatabase(fakeDb, savedAt)));
    const doc = restored.collections.media!.documents[0]!;
    expect(doc._id).toBeInstanceOf(ObjectId);
    expect((doc._id as ObjectId).equals(mediaId)).toBe(true);
    expect(doc.createdAt).toEqual(savedAt);
  });

  test("refuses a file that is not a backup", () => {
    expect(() => decodeBackup(encodeBackup({ nope: true } as never))).toThrow("Not a database backup.");
  });

  test("keeps 30 days and finds the newest", () => {
    const now = new Date("2026-10-31T03:00:00.000Z");
    const keys = ["daily/2026-09-30.json.gz", "daily/2026-10-01.json.gz", "daily/2026-10-02.json.gz", "daily/2026-10-31.json.gz"];
    expect(backupKey(now)).toBe("daily/2026-10-31.json.gz");
    expect(expiredBackupKeys(keys, now)).toEqual(["daily/2026-09-30.json.gz", "daily/2026-10-01.json.gz"]);
    expect(latestBackupKey(keys)).toBe("daily/2026-10-31.json.gz");
    expect(latestBackupKey([])).toBeNull();
  });
});
