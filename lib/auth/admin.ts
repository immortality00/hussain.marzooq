import crypto from "crypto";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SIG_NAME,
  SESSION_TTL_SECONDS,
  createSessionValue,
  isSessionValueFresh,
  safeEqual,
} from "./session-token";

const SCRYPT_KEYLEN = 64;

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function parseScryptHash(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Format: scrypt:<hex salt>:<hex hash>. Colon-delimited hex — deliberately NOT
  // "$"-delimited or base64. Next's env loader runs dotenv-expand, which treats
  // "$" as variable interpolation and silently corrupts any "$"-containing value;
  // base64 can also carry "+" / "/". Hex uses only [0-9a-f], which no env parser
  // touches. The generator script emits exactly this format — keep them in sync.
  const parts = trimmed.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return null;

  if (!/^[0-9a-f]+$/i.test(parts[1]) || !/^[0-9a-f]+$/i.test(parts[2])) return null;

  const salt = Buffer.from(parts[1], "hex");
  const hash = Buffer.from(parts[2], "hex");

  if (salt.length === 0 || hash.length === 0) return null;
  return { salt, hash };
}

export function verifyAdminPassword(password: string) {
  const hashValue = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (!hashValue) return false;

  const parsed = parseScryptHash(hashValue);
  if (!parsed) return false;

  const derivedKey = crypto.scryptSync(password, parsed.salt, parsed.hash.length || SCRYPT_KEYLEN);
  return crypto.timingSafeEqual(derivedKey, parsed.hash);
}

export function isAdminPasswordConfigured() {
  return Boolean((process.env.ADMIN_PASSWORD_HASH ?? "").trim());
}

/** Builds the cookie pair for a newly authenticated admin session. */
export function createAdminSessionCookies(secret: string) {
  const value = createSessionValue();

  const options = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };

  return [
    { name: COOKIE_NAME, value, options },
    { name: SIG_NAME, value: hmacHex(value, secret), options },
  ];
}

function verifyPair(value: string, signature: string): boolean {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret || !value || !signature) return false;
  if (!isSessionValueFresh(value)) return false;

  return safeEqual(signature, hmacHex(value, secret));
}

export async function isAdminAuthedServer(): Promise<boolean> {
  const jar = await cookies();
  return verifyPair(jar.get(COOKIE_NAME)?.value ?? "", jar.get(SIG_NAME)?.value ?? "");
}

export async function requireAdminOr401() {
  const ok = await isAdminAuthedServer();
  if (!ok) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
