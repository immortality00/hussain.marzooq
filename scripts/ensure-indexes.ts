import { MongoClient } from "mongodb";
import { ensureIndexes } from "@/lib/server/db-indexes";

// The live site runs the same list after every production deploy (netlify/functions/deploy-succeeded.mts).
// This command is for the e2e/test database, or the live one with the hm-app login.
try {
  process.loadEnvFile(".env.local");
} catch {}

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || "hm_visuals";
if (!uri) {
  console.error("Missing MONGODB_URI.");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  console.log(`Ensuring MongoDB indexes for database: ${dbName}`);
  await ensureIndexes(client.db(dbName), (line) => console.log(line));
  console.log("Done.");
} catch (error) {
  console.error("Failed to ensure indexes.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
}
