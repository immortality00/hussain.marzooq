import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Db } from "mongodb";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";
import { parseCloudinaryAssetFromUrl } from "@/lib/server/cloudinary-assets";

const COLLECTION = "testimonial_upload_sessions";

export const UPLOAD_SESSION_COOKIE = "hm_testimonial_upload";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9-]{16,64}$/;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

type UploadSessionStatus = "pending" | "committed";

type UploadSessionDoc = {
  _id: string;
  tokenHash: string;
  status: UploadSessionStatus;
  createdAt: Date;
  updatedAt?: Date;
  expiresAt: Date;
};

export type UploadSessionCredentials = { sessionId: string; token: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function isValidSessionId(value: string) {
  return SESSION_ID_PATTERN.test(value);
}

export function sessionFolder(sessionId: string) {
  return `${CLOUDINARY_TESTIMONIALS_FOLDER}/${sessionId}`;
}

export function sessionProfileFolder(sessionId: string) {
  return `${sessionFolder(sessionId)}/pfp`;
}

export function sessionPhotosFolder(sessionId: string) {
  return `${sessionFolder(sessionId)}/photos`;
}

export function isUrlInSession(url: string, sessionId: string) {
  const parsed = parseCloudinaryAssetFromUrl(url);
  if (!parsed) return false;

  const publicId = parsed.publicId.trim().replace(/^\/+/, "");
  return publicId.startsWith(`${sessionFolder(sessionId)}/`);
}

export function buildUploadCookieValue(sessionId: string, token: string) {
  return `${sessionId}.${token}`;
}

export function parseUploadCookieValue(
  value: string | null | undefined
): UploadSessionCredentials | null {
  if (!value) return null;

  const trimmed = value.trim();
  const dot = trimmed.indexOf(".");
  if (dot <= 0) return null;

  const sessionId = trimmed.slice(0, dot);
  const token = trimmed.slice(dot + 1);

  if (!SESSION_ID_PATTERN.test(sessionId) || !TOKEN_PATTERN.test(token)) return null;

  return { sessionId, token };
}

export function readUploadCookie(request: Request): UploadSessionCredentials | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;

    const name = part.slice(0, eq).trim();
    if (name !== UPLOAD_SESSION_COOKIE) continue;

    const raw = part.slice(eq + 1).trim();
    return parseUploadCookieValue(decodeURIComponent(raw));
  }

  return null;
}

export async function createUploadSession(db: Db) {
  const sessionId = randomUUID();
  const token = randomBytes(32).toString("hex");
  const now = new Date();

  await db.collection<UploadSessionDoc>(COLLECTION).insertOne({
    _id: sessionId,
    tokenHash: hashToken(token),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  return {
    sessionId,
    cookieValue: buildUploadCookieValue(sessionId, token),
    maxAgeSeconds: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export async function verifyUploadSession(
  db: Db,
  credentials: UploadSessionCredentials | null,
  options: { requirePending?: boolean } = {}
): Promise<{ sessionId: string; status: UploadSessionStatus } | null> {
  if (!credentials) return null;

  const { sessionId, token } = credentials;
  if (!SESSION_ID_PATTERN.test(sessionId) || !TOKEN_PATTERN.test(token)) return null;

  const doc = await db.collection<UploadSessionDoc>(COLLECTION).findOne({ _id: sessionId });
  if (!doc) return null;

  if (!safeEqualHex(doc.tokenHash, hashToken(token))) return null;
  if (doc.expiresAt instanceof Date && doc.expiresAt.getTime() <= Date.now()) return null;
  if (options.requirePending && doc.status !== "pending") return null;

  return { sessionId, status: doc.status };
}

export async function commitUploadSession(db: Db, sessionId: string) {
  const result = await db
    .collection<UploadSessionDoc>(COLLECTION)
    .updateOne({ _id: sessionId, status: "pending" }, { $set: { status: "committed", updatedAt: new Date() } });

  return result.matchedCount > 0;
}

export async function deleteUploadSession(db: Db, sessionId: string) {
  await db.collection<UploadSessionDoc>(COLLECTION).deleteOne({ _id: sessionId });
}
