import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  HINT_NAME,
  adminSessionSecret,
  issueSessionCookie,
  readSessionCookie,
  sessionCookieOptions,
  type ParsedSession,
} from "./session-token";
import { TRUSTED_DEVICE_COOKIE, issueTrustedDevice, trustedDeviceCookieOptions } from "./trusted-device";
import { readSessionGeneration } from "@/lib/server/admin-security";

const SCRYPT_KEYLEN = 64;

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

/** The plain cookie secret: the trusted-device key and the form tokens derive from it. */
export function adminCookieSecret() {
  return (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
}

type SessionCookieInput = { remember: boolean; generation: number; startedAt?: number };

/** Builds the cookies for a newly authenticated admin session. */
export async function createAdminSessionCookies(secret: string, { remember, generation, startedAt }: SessionCookieInput) {
  return [
    {
      name: COOKIE_NAME,
      value: await issueSessionCookie(secret, remember, startedAt, Date.now(), generation),
      options: sessionCookieOptions(remember),
    },
    { name: HINT_NAME, value: "1", options: sessionCookieOptions(remember, false) },
  ];
}

/** Signs the response's browser in; `trust` also marks the device as having passed the second step. */
export async function setAdminSession(res: NextResponse, input: SessionCookieInput & { trust?: boolean }) {
  for (const cookie of await createAdminSessionCookies(adminSessionSecret(), input)) {
    res.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  if (input.trust) trustDevice(res, input.generation);
}

export function trustDevice(res: NextResponse, generation: number) {
  res.cookies.set(TRUSTED_DEVICE_COOKIE, issueTrustedDevice(adminCookieSecret(), generation), trustedDeviceCookieOptions());
}

type SessionRead =
  | { ok: true; jar: Awaited<ReturnType<typeof cookies>>; secret: string; session: ParsedSession; renew: boolean }
  | { ok: false; revoked: boolean };

async function readAdminSession(): Promise<SessionRead> {
  const secret = adminSessionSecret();
  if (!secret) return { ok: false, revoked: false };

  const jar = await cookies();
  const check = await readSessionCookie(jar.get(COOKIE_NAME)?.value ?? "", secret);
  if (!check.ok) return { ok: false, revoked: false };

  if (check.session.generation !== (await readSessionGeneration())) {
    console.warn("[admin-auth] refused a session from before sign-out-everywhere");
    return { ok: false, revoked: true };
  }
  return { ok: true, jar, secret, session: check.session, renew: check.renew };
}

export async function isAdminAuthedServer(): Promise<boolean> {
  return (await readAdminSession()).ok;
}

/** The signed-in session, for routes that re-issue it (sign out everywhere keeps this device). */
export async function currentAdminSession(): Promise<ParsedSession | null> {
  const auth = await readAdminSession();
  return auth.ok ? auth.session : null;
}

async function renewAdminSession(
  jar: Awaited<ReturnType<typeof cookies>>,
  secret: string,
  session: ParsedSession
) {
  const fresh = await createAdminSessionCookies(secret, session);
  try {
    for (const cookie of fresh) {
      jar.set(cookie.name, cookie.value, cookie.options);
    }
  } catch {
    // Not in a context that can set cookies (a Server Component render) — the
    // proxy renews on page requests, so skipping here is harmless.
  }
}

export async function requireAdminOr401() {
  const auth = await readAdminSession();
  if (!auth.ok) {
    const body = auth.revoked ? { ok: false, error: "Unauthorized", reason: "revoked" } : { ok: false, error: "Unauthorized" };
    return Response.json(body, { status: 401 });
  }
  if (auth.renew) await renewAdminSession(auth.jar, auth.secret, auth.session);
  return null;
}
