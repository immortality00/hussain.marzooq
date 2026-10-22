import { Binary, ObjectId } from "mongodb";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { getDb } from "./db";
import { SITE_URL } from "@/lib/seo/site-url";
import { cleanDeviceLabel } from "@/lib/push-subscription";

type PasskeyDoc = {
  _id: ObjectId;
  credentialId: string;
  publicKey: Binary;
  counter: number;
  transports: string[];
  name: string;
  synced: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export type AdminPasskey = {
  id: string;
  name: string;
  synced: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
};

export type NewPasskey = {
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  transports: string[];
  name: string;
  synced: boolean;
};

export const PASSKEY_TIMEOUT_MS = 60_000;

/** Passkeys are bound to the site's own host: hussain.art live, localhost in dev and e2e. */
export function relyingParty() {
  const url = new URL(SITE_URL);
  return { rpID: url.hostname, origin: url.origin, rpName: "Hussain.Art Admin" };
}

async function passkeyCollection() {
  const db = await getDb();
  return db.collection<PasskeyDoc>("admin_passkeys");
}

const isoOrNull = (value: unknown) => (value instanceof Date ? value.toISOString() : null);

export async function listPasskeys(): Promise<AdminPasskey[]> {
  const docs = await (await passkeyCollection())
    .find({}, { projection: { name: 1, synced: 1, createdAt: 1, lastUsedAt: 1 } })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();
  return docs.map((doc) => ({
    id: String(doc._id),
    name: cleanDeviceLabel(doc.name),
    synced: doc.synced === true,
    createdAt: isoOrNull(doc.createdAt),
    lastUsedAt: isoOrNull(doc.lastUsedAt),
  }));
}

export async function countPasskeys(): Promise<number> {
  return (await passkeyCollection()).countDocuments({});
}

export async function credentialDescriptors() {
  const docs = await (await passkeyCollection())
    .find({}, { projection: { credentialId: 1, transports: 1 } })
    .toArray();
  return docs.map((doc) => ({ id: doc.credentialId, transports: doc.transports ?? [] }));
}

export async function savePasskey(passkey: NewPasskey, now: Date = new Date()) {
  await (await passkeyCollection()).insertOne({
    _id: new ObjectId(),
    credentialId: passkey.credentialId,
    publicKey: new Binary(Buffer.from(passkey.publicKey)),
    counter: passkey.counter,
    transports: passkey.transports.slice(0, 8).map((value) => value.slice(0, 32)),
    name: cleanDeviceLabel(passkey.name),
    synced: passkey.synced,
    createdAt: now,
    lastUsedAt: null,
  });
}

/** Refuses to remove the last passkey, so the second step can never be switched off from the admin. */
export async function removePasskey(id: ObjectId): Promise<"removed" | "missing" | "last"> {
  const col = await passkeyCollection();
  if (!(await col.findOne({ _id: id }, { projection: { _id: 1 } }))) return "missing";
  if ((await col.countDocuments({})) <= 1) return "last";
  const result = await col.deleteOne({ _id: id });
  return result.deletedCount ? "removed" : "missing";
}

export async function passkeyAuthenticationOptions() {
  const { rpID } = relyingParty();
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: await credentialDescriptors(),
    userVerification: "required",
    timeout: PASSKEY_TIMEOUT_MS,
  });
}

/** Checks a Face ID / Touch ID answer against the stored passkey and records its use. */
export async function verifyPasskeyAnswer(response: AuthenticationResponseJSON, expectedChallenge: string) {
  const col = await passkeyCollection();
  const doc = await col.findOne({ credentialId: response.id });
  if (!doc) return false;

  const { rpID, origin } = relyingParty();
  const result = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: doc.credentialId,
      publicKey: new Uint8Array(doc.publicKey.buffer),
      // A synced passkey is one key on several devices, so its counter cannot reveal a copy.
      counter: doc.synced ? 0 : doc.counter,
      transports: doc.transports,
    },
  }).catch(() => null);
  if (!result?.verified) return false;

  await col.updateOne(
    { _id: doc._id },
    { $set: { counter: result.authenticationInfo.newCounter, lastUsedAt: new Date() } }
  );
  return true;
}
