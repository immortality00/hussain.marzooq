import { MongoClient, type Db } from "mongodb";
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

// One connection per test worker; Playwright ends the worker process when the run is over.
let connection: Promise<MongoClient> | undefined;

function e2eDb(): Promise<Db> {
  connection ??= new MongoClient(mongoUri()).connect().catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection.then((client) => client.db(E2E.dbName));
}

/** Back to "no passkey yet" on the e2e database, so every other spec signs in with the password alone. */
export async function resetAdminSecurity() {
  const db = await e2eDb();
  for (const name of ["admin_passkeys", "admin_auth_requests", "admin_security"]) {
    await db.collection(name).deleteMany({});
  }
}

/**
 * The login route allows 30 password sign-ins an hour across the whole site from devices that are not
 * trusted (`admin-login-site`, app/admin/login/route.ts), and the suite signs in more often than that.
 */
export async function resetSiteSignInLimit() {
  const db = await e2eDb();
  await db.collection("request_guards").deleteMany({ bucket: "admin-login-site" });
}
