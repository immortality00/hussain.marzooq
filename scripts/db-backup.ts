import { writeFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { backupCounts, encodeBackup, exportDatabase } from "@/lib/server/db-backup";

process.loadEnvFile(".env.local");

const out = process.argv[2];
if (!out) {
  console.error("Usage: npm run db:backup -- <file.json.gz>");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI ?? "");
await client.connect();
try {
  const backup = await exportDatabase(client.db(process.env.MONGODB_DB_NAME || "hm_visuals"));
  writeFileSync(out, encodeBackup(backup));
  console.table(backupCounts(backup));
  console.log(`Saved ${backup.database} to ${out}`);
} finally {
  await client.close();
}
