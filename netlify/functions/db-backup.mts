import { getStore } from "@netlify/blobs";
import { MongoClient } from "mongodb";
import {
  BACKUP_PREFIX,
  BACKUP_STORE,
  backupCounts,
  backupKey,
  encodeBackup,
  expiredBackupKeys,
  exportDatabase,
} from "../../lib/server/db-backup";

export default async function dbBackup() {
  const now = new Date();
  const client = new MongoClient(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  try {
    const backup = await exportDatabase(client.db(process.env.MONGODB_DB_NAME || "hm_visuals"), now);
    const store = getStore(BACKUP_STORE);
    const key = backupKey(now);
    await store.set(key, new Uint8Array(encodeBackup(backup)).buffer, {
      metadata: { createdAt: backup.createdAt, counts: backupCounts(backup) },
    });
    const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
    const expired = expiredBackupKeys(blobs.map((blob) => blob.key), now);
    await Promise.all(expired.map((old) => store.delete(old)));
    console.info(`[db-backup] saved ${key}, removed ${expired.length}`, backupCounts(backup));
  } finally {
    await client.close();
  }
}

export const config = { schedule: "0 3 * * *" };
