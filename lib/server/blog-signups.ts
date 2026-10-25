import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/server/db";

/** How long a confirmation link works. Mongo's TTL index deletes the sign-up after it. */
export const SIGNUP_LINK_TTL_MS = 24 * 60 * 60 * 1000;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type SignupDoc = { _id: string; email: string; createdAt: Date; expiresAt: Date; confirmedAt?: Date };

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function signups() {
  const db = await getDb();
  return db.collection<SignupDoc>("blog_signups");
}

export function isSignupToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

/** Stores an unconfirmed sign-up and returns the token for its confirmation link. Only the token's hash is stored. */
export async function createSignup(email: string, now: Date = new Date()): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await (await signups()).insertOne({
    _id: tokenHash(token),
    email,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SIGNUP_LINK_TTL_MS),
  });
  return token;
}

/** The sign-up behind a link, if it is still valid. The TTL sweep runs once a minute, so expiry is checked here too. */
export async function findSignup(token: string, now: Date = new Date()): Promise<SignupDoc | null> {
  const doc = await (await signups()).findOne({ _id: tokenHash(token) });
  return doc && doc.expiresAt.getTime() > now.getTime() ? doc : null;
}

/** Kept until it expires, so opening the link again still shows the subscription as confirmed. */
export async function markSignupConfirmed(token: string, now: Date = new Date()) {
  await (await signups()).updateOne({ _id: tokenHash(token) }, { $set: { confirmedAt: now } });
}

export async function deleteSignup(token: string) {
  await (await signups()).deleteOne({ _id: tokenHash(token) });
}
