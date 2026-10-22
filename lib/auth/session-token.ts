/**
 * Admin session token — shared by the Edge proxy and the Node server code.
 *
 * MUST stay runtime-agnostic: no `node:crypto`, no `next/headers`, no DB.
 * `proxy.ts` runs in the Edge runtime and imports this file; adding a Node-only
 * import here will break admin auth at the middleware layer.
 *
 * Cookie value:  v5.<issuedAtMs>.<startedAtMs>.<r|s>.<generation>.<nonce>.<HMAC hex of everything before it>
 * `issuedAt` moves forward on every renewal (idle window); `startedAt` is the original
 * login and never moves (absolute cap). Both and the remember flag are inside the signed
 * payload, so lifetime is enforced server-side and cannot be extended by editing the cookie.
 * `generation` is the sign-out-everywhere counter; the Node side compares it with the
 * database (lib/server/admin-security.ts). The signing key includes ADMIN_PASSWORD_HASH,
 * so changing the password ends every session, here at the edge as well.
 */

export const COOKIE_NAME = "hm_admin";
export const HINT_NAME = "hm_admin_ui";

/** Not remembered: a browser-session cookie, 12 hours idle, 7 days absolute. */
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;
/** "Remember this device": 30 days idle (renewed on activity), 90 days absolute. */
export const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
export const REMEMBER_ABSOLUTE_MS = 90 * 24 * 60 * 60 * 1000;
/** A token this much older than its last renewal gets re-issued on the next request. */
export const RENEW_AFTER_MS = 10 * 60 * 1000;
export const REMEMBER_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

const TOKEN_VERSION = "v5";

export type ParsedSession = { issuedAt: number; startedAt: number; remember: boolean; generation: number };
export type SessionFailure = "malformed" | "expired" | "future" | "signature";
export type SessionCheck =
  | { ok: true; session: ParsedSession; renew: boolean }
  | { ok: false; reason: SessionFailure };

/** The key admin cookies are signed with: empty when ADMIN_COOKIE_SECRET is unset. */
export function adminSessionSecret(): string {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) return "";
  return `${secret}\n${(process.env.ADMIN_PASSWORD_HASH ?? "").trim()}`;
}

export function sessionLifetimeMs(remember: boolean): number {
  return remember ? REMEMBER_MS : SESSION_IDLE_MS;
}

export function sessionAbsoluteMs(remember: boolean): number {
  return remember ? REMEMBER_ABSOLUTE_MS : SESSION_ABSOLUTE_MS;
}

export function renewAfterMs(remember: boolean): number {
  return remember ? REMEMBER_RENEW_AFTER_MS : RENEW_AFTER_MS;
}

/** Cookie maxAge in seconds — undefined for a non-remembered (browser-session) cookie. */
export function sessionCookieMaxAge(remember: boolean): number | undefined {
  return remember ? REMEMBER_MS / 1000 : undefined;
}

export function sessionCookieOptions(remember: boolean, httpOnly: boolean = true) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookieMaxAge(remember),
  };
}

/** Creates a fresh token value. Uses Web Crypto — available in Edge and Node 18+. */
export function createSessionValue(
  remember: boolean = false,
  now: number = Date.now(),
  startedAt: number = now,
  generation: number = 0
): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${TOKEN_VERSION}.${now}.${startedAt}.${remember ? "r" : "s"}.${generation}.${nonce}`;
}

/** Returns the parsed token, or null if the value is malformed / not this version. */
export function parseSession(value: string): ParsedSession | null {
  const parts = value.split(".");
  if (parts.length !== 6) return null;
  if (parts[0] !== TOKEN_VERSION) return null;

  const issuedAt = Number(parts[1]);
  const startedAt = Number(parts[2]);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return null;
  if (!Number.isFinite(startedAt) || startedAt <= 0 || startedAt > issuedAt) return null;
  if (parts[3] !== "r" && parts[3] !== "s") return null;
  if (!/^\d{1,9}$/.test(parts[4])) return null;
  if (!parts[5]) return null;

  return { issuedAt, startedAt, remember: parts[3] === "r", generation: Number(parts[4]) };
}

/** True when the token is inside both its idle window and its absolute cap. */
export function isWithinTtl(
  session: Pick<ParsedSession, "issuedAt" | "startedAt" | "remember">,
  now: number = Date.now()
): boolean {
  const idle = now - session.issuedAt;
  const total = now - session.startedAt;
  if (idle < -CLOCK_SKEW_MS) return false;
  return idle <= sessionLifetimeMs(session.remember) && total <= sessionAbsoluteMs(session.remember);
}

/** Length-safe, constant-time string comparison. Works in every runtime. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function issueSessionCookie(
  secret: string,
  remember: boolean,
  startedAt?: number,
  now: number = Date.now(),
  generation: number = 0
): Promise<string> {
  const value = createSessionValue(remember, now, startedAt ?? now, generation);
  return `${value}.${await hmacHex(value, secret)}`;
}

export async function readSessionCookie(
  cookie: string,
  secret: string,
  now: number = Date.now()
): Promise<SessionCheck> {
  const cut = cookie.lastIndexOf(".");
  const value = cut > 0 ? cookie.slice(0, cut) : "";
  const session = parseSession(value);
  if (!session) return { ok: false, reason: "malformed" };
  if (now - session.issuedAt < -CLOCK_SKEW_MS) return { ok: false, reason: "future" };
  if (!isWithinTtl(session, now)) return { ok: false, reason: "expired" };
  if (!safeEqual(cookie.slice(cut + 1), await hmacHex(value, secret))) {
    return { ok: false, reason: "signature" };
  }

  return { ok: true, session, renew: now - session.issuedAt > renewAfterMs(session.remember) };
}
