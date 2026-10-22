import { randomBytes } from "node:crypto";
import { getDb } from "./db";

type Registration = { challenge: string; expiresAt: Date };

type AdminSecurityDoc = {
  _id: string;
  generation?: number;
  userId?: string;
  registration?: Registration | null;
  updatedAt?: Date;
};

const DOC_ID = "admin";
const REGISTRATION_MS = 5 * 60 * 1000;

async function securityCollection() {
  const db = await getDb();
  return db.collection<AdminSecurityDoc>("admin_security");
}

/** The sign-out-everywhere counter; every session and trusted device carries the value it was issued under. */
export async function readSessionGeneration(): Promise<number> {
  const doc = await (await securityCollection()).findOne({ _id: DOC_ID }, { projection: { generation: 1 } });
  return typeof doc?.generation === "number" ? doc.generation : 0;
}

export async function bumpSessionGeneration(): Promise<number> {
  const doc = await (await securityCollection()).findOneAndUpdate(
    { _id: DOC_ID },
    { $inc: { generation: 1 }, $set: { updatedAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  );
  return typeof doc?.generation === "number" ? doc.generation : 1;
}

/** The WebAuthn user handle: random, fixed once created, never the admin's name or email. */
export async function passkeyUserId(): Promise<string> {
  const col = await securityCollection();
  const fresh = randomBytes(32).toString("base64url");
  await col.updateOne({ _id: DOC_ID, userId: { $exists: false } }, { $set: { userId: fresh } }, { upsert: true }).catch(
    (error: unknown) => {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  );
  const doc = await col.findOne({ _id: DOC_ID }, { projection: { userId: 1 } });
  if (!doc?.userId) throw new Error("Could not create the passkey user.");
  return doc.userId;
}

export async function saveRegistrationChallenge(challenge: string, now: number = Date.now()) {
  const registration = { challenge, expiresAt: new Date(now + REGISTRATION_MS) };
  await (await securityCollection()).updateOne({ _id: DOC_ID }, { $set: { registration } }, { upsert: true });
}

/** Returns the pending registration challenge once, then clears it. */
export async function takeRegistrationChallenge(now: number = Date.now()): Promise<string | null> {
  const doc = await (await securityCollection()).findOneAndUpdate(
    { _id: DOC_ID, "registration.expiresAt": { $gt: new Date(now) } },
    { $set: { registration: null } },
    { projection: { registration: 1 } }
  );
  return doc?.registration?.challenge ?? null;
}
