/**
 * Admin session token — shared by the Edge proxy and the Node server code.
 *
 * MUST stay runtime-agnostic: no `node:crypto`, no `next/headers`, no DB.
 * `proxy.ts` runs in the Edge runtime and imports this file; adding a Node-only
 * import here will break admin auth at the middleware layer.
 *
 * Token format:  v1.<issuedAtMs>.<nonce>   signed separately as an HMAC hex string.
 * The timestamp is inside the signed payload, so expiry is enforced server-side
 * and cannot be extended by editing the cookie.
 */

export const COOKIE_NAME = "hm_admin";
export const SIG_NAME = "hm_admin_sig";

/**
 * Session lifetime. Also used as the cookie maxAge.
 *
 * Tokens are stateless — expiry is enforced server-side, but logout cannot kill a
 * token before it expires. Kept deliberately short (2 days) to bound the exposure of
 * a stolen token. True revocation would require a session store the Edge proxy can
 * reach (see SESSION-QUEUE.md S1 item 5) and is out of scope here.
 */
export const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

const TOKEN_VERSION = "v1";

/** Creates a fresh token value. Uses Web Crypto — available in Edge and Node 18+. */
export function createSessionValue(now: number = Date.now()): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${TOKEN_VERSION}.${now}.${nonce}`;
}

/** Returns the issue time, or null if the value is malformed / not this version. */
export function parseIssuedAt(value: string): number | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  if (parts[0] !== TOKEN_VERSION) return null;

  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return null;
  if (!parts[2]) return null;

  return issuedAt;
}

/** True when the token is still inside its lifetime (and not issued in the future). */
export function isWithinTtl(issuedAt: number, now: number = Date.now()): boolean {
  const age = now - issuedAt;
  // Allow 60s of clock skew for tokens that look very slightly future-dated.
  if (age < -60_000) return false;
  return age <= SESSION_TTL_MS;
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

/** Shape check + expiry. Signature verification is runtime-specific, done by callers. */
export function isSessionValueFresh(value: string, now: number = Date.now()): boolean {
  const issuedAt = parseIssuedAt(value);
  if (issuedAt === null) return false;
  return isWithinTtl(issuedAt, now);
}
