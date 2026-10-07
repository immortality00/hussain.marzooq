import { gunzipSync, gzipSync } from "node:zlib";
import { BSON, type Db } from "mongodb";

export const BACKUP_STORE = "db-backups";
export const BACKUP_PREFIX = "daily/";
export const BACKUP_KEEP_DAYS = 30;
export const BACKUP_EXCLUDED = ["testimonial_locations", "request_guards"];

type IndexSpec = { name: string; key: Record<string, unknown>; [option: string]: unknown };

export type DatabaseBackup = {
  version: 1;
  createdAt: string;
  database: string;
  excluded: string[];
  collections: Record<string, { documents: Record<string, unknown>[]; indexes: IndexSpec[] }>;
};

export function backupKey(date: Date) {
  return `${BACKUP_PREFIX}${date.toISOString().slice(0, 10)}.json.gz`;
}

export function expiredBackupKeys(keys: string[], now: Date, keepDays = BACKUP_KEEP_DAYS) {
  const oldest = backupKey(new Date(now.getTime() - (keepDays - 1) * 86_400_000));
  return keys.filter((key) => key.startsWith(BACKUP_PREFIX) && key < oldest);
}

export function latestBackupKey(keys: string[]) {
  return keys.filter((key) => key.startsWith(BACKUP_PREFIX)).sort().at(-1) ?? null;
}

function indexSpec(index: IndexSpec): IndexSpec {
  const spec = { ...index };
  delete spec.v;
  delete spec.ns;
  return spec;
}

export async function exportDatabase(db: Db, now = new Date()): Promise<DatabaseBackup> {
  const names = (await db.listCollections({}, { nameOnly: true }).toArray())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("system.") && !BACKUP_EXCLUDED.includes(name))
    .sort();

  const collections: DatabaseBackup["collections"] = {};
  for (const name of names) {
    const collection = db.collection(name);
    const [documents, indexes] = await Promise.all([
      collection.find({}).toArray(),
      collection.listIndexes().toArray() as Promise<IndexSpec[]>,
    ]);
    collections[name] = {
      documents,
      indexes: indexes.filter((index) => index.name !== "_id_").map(indexSpec),
    };
  }

  return { version: 1, createdAt: now.toISOString(), database: db.databaseName, excluded: BACKUP_EXCLUDED, collections };
}

export function encodeBackup(backup: DatabaseBackup): Buffer {
  return gzipSync(BSON.EJSON.stringify(backup, { relaxed: false }));
}

export function decodeBackup(data: Uint8Array): DatabaseBackup {
  const backup = BSON.EJSON.parse(gunzipSync(data).toString("utf8"), { relaxed: false }) as DatabaseBackup;
  if (Number(backup?.version) !== 1 || typeof backup.collections !== "object") throw new Error("Not a database backup.");
  return backup;
}

export function backupCounts(backup: DatabaseBackup) {
  return Object.fromEntries(Object.entries(backup.collections).map(([name, c]) => [name, c.documents.length]));
}
