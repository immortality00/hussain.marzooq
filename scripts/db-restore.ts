import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { decodeBackup } from "@/lib/server/db-backup";

process.loadEnvFile(".env.local");

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));
const production = args.includes("--production");
const target = args.find((arg) => arg.startsWith("--db="))?.slice(5) || process.env.MONGODB_DB_NAME || "hm_visuals";

if (!file) {
  console.error("Usage: npm run db:restore -- <file.json.gz> [--db=<name>] [--production]");
  process.exit(1);
}
if (!/(e2e|test)/i.test(target) && !production) {
  console.error(`Refusing to overwrite "${target}". Restoring into a live database needs --production.`);
  process.exit(1);
}

const backup = decodeBackup(readFileSync(file));
const client = new MongoClient(process.env.MONGODB_URI ?? "");
await client.connect();

try {
  const db = client.db(target);
  const rows: { collection: string; inBackup: number; restored: number; match: boolean }[] = [];

  for (const [name, { documents, indexes }] of Object.entries(backup.collections)) {
    const collection = db.collection(name);
    await collection.deleteMany({});
    for (let start = 0; start < documents.length; start += 1000) {
      await collection.insertMany(documents.slice(start, start + 1000), { ordered: false });
    }
    if (indexes.length > 0) await collection.createIndexes(indexes as never);
    const restored = await collection.countDocuments();
    rows.push({ collection: name, inBackup: documents.length, restored, match: restored === documents.length });
  }

  console.table(rows);
  console.log(`Restored ${backup.database} (${backup.createdAt}) into ${target}. Not in backups: ${backup.excluded.join(", ")}.`);
  if (rows.some((row) => !row.match)) process.exitCode = 1;
} finally {
  await client.close();
}
