import crypto from "crypto";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  HINT_NAME,
  issueSessionCookie,
  readSessionCookie,
  sessionCookieOptions,
  type ParsedSession,
} from "./session-token";

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

/** Builds the cookies for a newly authenticated admin session. */
export async function createAdminSessionCookies(
  secret: string,
  remember: boolean = false,
  startedAt?: number
) {
  return [
    {
      name: COOKIE_NAME,
      value: await issueSessionCookie(secret, remember, startedAt),
      options: sessionCookieOptions(remember),
    },
    { name: HINT_NAME, value: "1", options: sessionCookieOptions(remember, false) },
  ];
}

async function readAdminSession() {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) return null;

  const jar = await cookies();
  const check = await readSessionCookie(jar.get(COOKIE_NAME)?.value ?? "", secret);
  return check.ok ? { jar, secret, session: check.session, renew: check.renew } : null;
}

export async function isAdminAuthedServer(): Promise<boolean> {
  return (await readAdminSession()) !== null;
}

async function renewAdminSession(
  jar: Awaited<ReturnType<typeof cookies>>,
  secret: string,
  session: ParsedSession
) {
  const fresh = await createAdminSessionCookies(secret, session.remember, session.startedAt);
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
  if (!auth) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (auth.renew) await renewAdminSession(auth.jar, auth.secret, auth.session);
  return null;
}
