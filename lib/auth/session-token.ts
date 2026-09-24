/**
 * Admin session token — shared by the Edge proxy and the Node server code.
 *
 * MUST stay runtime-agnostic: no `node:crypto`, no `next/headers`, no DB.
 * `proxy.ts` runs in the Edge runtime and imports this file; adding a Node-only
 * import here will break admin auth at the middleware layer.
 *
 * Token format:  v3.<issuedAtMs>.<startedAtMs>.<r|s>.<nonce>   signed separately as an HMAC hex string.
 * `issuedAt` moves forward on every renewal (idle window); `startedAt` is the original
 * login and never moves (absolute cap). Both and the remember flag are inside the signed
 * payload, so lifetime is enforced server-side and cannot be extended by editing the cookie.
 */

export const COOKIE_NAME = "hm_admin";
export const SIG_NAME = "hm_admin_sig";

/** Not remembered: a browser-session cookie, 12 hours idle, 7 days absolute. */
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;
/** "Remember this device": 30 days idle (renewed on activity), 90 days absolute. */
export const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
export const REMEMBER_ABSOLUTE_MS = 90 * 24 * 60 * 60 * 1000;
/** A token this much older than its last renewal gets re-issued on the next request. */
export const RENEW_AFTER_MS = 10 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

const TOKEN_VERSION = "v3";

export type ParsedSession = { issuedAt: number; startedAt: number; remember: boolean };
export type SessionFailure = "malformed" | "expired" | "future";

export function sessionLifetimeMs(remember: boolean): number {
  return remember ? REMEMBER_MS : SESSION_IDLE_MS;
}

export function sessionAbsoluteMs(remember: boolean): number {
  return remember ? REMEMBER_ABSOLUTE_MS : SESSION_ABSOLUTE_MS;
}

/** Cookie maxAge in seconds — undefined for a non-remembered (browser-session) cookie. */
export function sessionCookieMaxAge(remember: boolean): number | undefined {
  return remember ? REMEMBER_MS / 1000 : undefined;
}

/** Creates a fresh token value. Uses Web Crypto — available in Edge and Node 18+. */
export function createSessionValue(
  remember: boolean = false,
  now: number = Date.now(),
  startedAt: number = now
): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${TOKEN_VERSION}.${now}.${startedAt}.${remember ? "r" : "s"}.${nonce}`;
}

/** Returns the parsed token, or null if the value is malformed / not this version. */
export function parseSession(value: string): ParsedSession | null {
  const parts = value.split(".");
  if (parts.length !== 5) return null;
  if (parts[0] !== TOKEN_VERSION) return null;

  const issuedAt = Number(parts[1]);
  const startedAt = Number(parts[2]);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return null;
  if (!Number.isFinite(startedAt) || startedAt <= 0 || startedAt > issuedAt) return null;
  if (parts[3] !== "r" && parts[3] !== "s") return null;
  if (!parts[4]) return null;

  return { issuedAt, startedAt, remember: parts[3] === "r" };
}

/** True when the token is inside both its idle window and its absolute cap. */
export function isWithinTtl(session: ParsedSession, now: number = Date.now()): boolean {
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

/** Why a token is unusable, or null when it is fine. Signature is checked by callers. */
export function sessionFailure(value: string, now: number = Date.now()): SessionFailure | null {
  const session = parseSession(value);
  if (!session) return "malformed";
  if (now - session.issuedAt < -CLOCK_SKEW_MS) return "future";
  if (!isWithinTtl(session, now)) return "expired";
  return null;
}

/** Shape check + expiry. Signature verification is runtime-specific, done by callers. */
export function isSessionValueFresh(value: string, now: number = Date.now()): boolean {
  return sessionFailure(value, now) === null;
}

/** True when a valid token has gone long enough since issue that it should be re-issued. */
export function shouldRenewSession(value: string, now: number = Date.now()): boolean {
  const session = parseSession(value);
  if (!session || !isWithinTtl(session, now)) return false;
  return now - session.issuedAt > RENEW_AFTER_MS;
}
