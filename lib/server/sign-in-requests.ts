import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { getDb } from "./db";

export const PENDING_SIGN_IN_COOKIE = "hm_admin_pending";
export const SIGN_IN_REQUEST_MS = 5 * 60 * 1000;
const MAX_PASSKEY_ATTEMPTS = 5;

type ApprovalStatus = "pending" | "approved" | "rejected";

type Approval = {
  number: number;
  choices: number[];
  status: ApprovalStatus;
  challenge: string | null;
  requestedAt: Date;
  decidedAt: Date | null;
};

type SignInRequestDoc = {
  _id: string;
  tokenHash: string;
  remember: boolean;
  next: string;
  device: string;
  challenge: string | null;
  attempts: number;
  approval: Approval | null;
  createdAt: Date;
  expiresAt: Date;
};

export type SignInRequest = SignInRequestDoc;

export type PendingSignIn = {
  id: string;
  device: string;
  createdAt: string;
  expiresAt: string;
  choices: number[];
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function requestCollection() {
  const db = await getDb();
  return db.collection<SignInRequestDoc>("admin_auth_requests");
}

export function pendingCookieOptions(maxAgeSeconds: number = SIGN_IN_REQUEST_MS / 1000) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: maxAgeSeconds,
  };
}

/** Opened only after the right password: the browser gets `<id>.<token>`, the database keeps sha256(token). */
export async function openSignInRequest(
  input: { remember: boolean; next: string; device: string },
  now: number = Date.now()
) {
  const id = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  await (await requestCollection()).insertOne({
    _id: id,
    tokenHash: sha256(token),
    remember: input.remember,
    next: input.next,
    device: input.device,
    challenge: null,
    attempts: 0,
    approval: null,
    createdAt: new Date(now),
    expiresAt: new Date(now + SIGN_IN_REQUEST_MS),
  });
  return `${id}.${token}`;
}

function parseCookie(value: string | undefined) {
  if (!value || value.length > 200) return null;
  const [id, token, extra] = value.split(".");
  if (extra !== undefined || !/^[0-9a-f]{32}$/.test(id ?? "") || !/^[0-9a-f]{64}$/.test(token ?? "")) return null;
  return { id: id!, token: token! };
}

export async function readSignInRequest(cookie: string | undefined, now: number = Date.now()) {
  const parsed = parseCookie(cookie);
  if (!parsed) return null;
  const doc = await (await requestCollection()).findOne({ _id: parsed.id });
  if (!doc || doc.expiresAt.getTime() <= now) return null;
  const given = Buffer.from(sha256(parsed.token));
  const stored = Buffer.from(doc.tokenHash);
  return given.length === stored.length && timingSafeEqual(given, stored) ? doc : null;
}

export async function setSignInChallenge(id: string, challenge: string) {
  await (await requestCollection()).updateOne({ _id: id }, { $set: { challenge } });
}

/** Each challenge answers one Face ID attempt. */
export async function takeSignInChallenge(id: string) {
  const doc = await (await requestCollection()).findOneAndUpdate(
    { _id: id },
    { $set: { challenge: null } },
    { projection: { challenge: 1 } }
  );
  return doc?.challenge ?? null;
}

/** A failed Face ID answer; the request is dropped after five. */
export async function failPasskeyAttempt(id: string) {
  const col = await requestCollection();
  const doc = await col.findOneAndUpdate({ _id: id }, { $inc: { attempts: 1 } }, { returnDocument: "after" });
  if (doc && doc.attempts >= MAX_PASSKEY_ATTEMPTS) await col.deleteOne({ _id: id });
}

/** One use: whoever deletes the request first is the one who signs in. */
export async function finishSignInRequest(id: string, now: number = Date.now()) {
  return (await requestCollection()).findOneAndDelete({ _id: id, expiresAt: { $gt: new Date(now) } });
}

export async function dropSignInRequest(id: string) {
  await (await requestCollection()).deleteOne({ _id: id });
}

export function approvalChoices(number: number, pick: (min: number, max: number) => number = randomInt) {
  const choices = new Set([number]);
  while (choices.size < 3) choices.add(pick(10, 100));
  const list = [...choices];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = pick(0, i + 1);
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

/** Starts approval once per request; a second press returns the same number without notifying again. */
export async function startApproval(doc: SignInRequestDoc, now: number = Date.now()) {
  if (doc.approval) return { number: doc.approval.number, started: false };
  const number = randomInt(10, 100);
  const approval: Approval = {
    number,
    choices: approvalChoices(number),
    status: "pending",
    challenge: null,
    requestedAt: new Date(now),
    decidedAt: null,
  };
  const result = await (await requestCollection()).updateOne(
    { _id: doc._id, approval: null },
    { $set: { approval } }
  );
  if (result.modifiedCount) return { number, started: true };
  const current = await (await requestCollection()).findOne({ _id: doc._id }, { projection: { approval: 1 } });
  return { number: current?.approval?.number ?? number, started: false };
}

export async function listPendingSignIns(now: number = Date.now()): Promise<PendingSignIn[]> {
  const docs = await (await requestCollection())
    .find(
      { "approval.status": "pending", expiresAt: { $gt: new Date(now) } },
      { projection: { device: 1, createdAt: 1, expiresAt: 1, "approval.choices": 1 } }
    )
    .sort({ createdAt: -1, _id: 1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id,
    device: doc.device,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString(),
    choices: doc.approval?.choices ?? [],
  }));
}

export async function findPendingApproval(id: string, now: number = Date.now()) {
  if (!/^[0-9a-f]{32}$/.test(id)) return null;
  return (await requestCollection()).findOne({
    _id: id,
    "approval.status": "pending",
    expiresAt: { $gt: new Date(now) },
  });
}

export async function setApprovalChallenge(id: string, challenge: string) {
  await (await requestCollection()).updateOne(
    { _id: id, "approval.status": "pending" },
    { $set: { "approval.challenge": challenge } }
  );
}

export async function takeApprovalChallenge(id: string) {
  const doc = await (await requestCollection()).findOneAndUpdate(
    { _id: id, "approval.status": "pending" },
    { $set: { "approval.challenge": null } },
    { projection: { "approval.challenge": 1 } }
  );
  return doc?.approval?.challenge ?? null;
}

/** Settles a pending approval; false when it was already decided or has expired. */
export async function decideApproval(id: string, status: Exclude<ApprovalStatus, "pending">, now: number = Date.now()) {
  const result = await (await requestCollection()).updateOne(
    { _id: id, "approval.status": "pending", expiresAt: { $gt: new Date(now) } },
    { $set: { "approval.status": status, "approval.decidedAt": new Date(now), "approval.challenge": null } }
  );
  return result.modifiedCount === 1;
}
