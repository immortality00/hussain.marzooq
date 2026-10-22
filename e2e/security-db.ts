import { MongoClient } from "mongodb";
import { E2E } from "./fixtures";

function mongoUri() {
  if (!process.env.MONGODB_URI) {
    try {
      process.loadEnvFile(".env.local");
    } catch {}
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI for the e2e database.");
  return uri;
}

/** Back to "no passkey yet" on the e2e database, so every other spec signs in with the password alone. */
export async function resetAdminSecurity() {
  const client = new MongoClient(mongoUri());
  try {
    await client.connect();
    const db = client.db(E2E.dbName);
    for (const name of ["admin_passkeys", "admin_auth_requests", "admin_security"]) {
      await db.collection(name).deleteMany({});
    }
  } finally {
    await client.close();
  }
}
