import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const TRUSTED_DEVICE_COOKIE = "hm_admin_device";
export const TRUSTED_DEVICE_MS = 365 * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const VERSION = "v2";

function deviceKey(secret: string) {
  return createHmac("sha256", secret).update("hm-trusted-device").digest();
}

function sign(secret: string, payload: string) {
  return createHmac("sha256", deviceKey(secret)).update(payload).digest("hex");
}

/** v2.<issuedAtMs>.<generation>.<nonce>.<hmac> — earned only by passing the second sign-in step. */
export function issueTrustedDevice(secret: string, generation: number, now: number = Date.now()) {
  const payload = `${VERSION}.${now}.${generation}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(secret, payload)}`;
}

export function isTrustedDevice(
  value: string | undefined,
  secret: string,
  generation: number,
  now: number = Date.now()
) {
  if (!value || !secret || value.length > 200) return false;
  const parts = value.split(".");
  if (parts.length !== 5 || parts[0] !== VERSION) return false;
  if (!/^\d{1,15}$/.test(parts[1]) || !/^\d{1,9}$/.test(parts[2])) return false;

  const expected = Buffer.from(sign(secret, parts.slice(0, 4).join(".")));
  const given = Buffer.from(parts[4]);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  if (Number(parts[2]) !== generation) return false;

  const age = now - Number(parts[1]);
  return age >= -CLOCK_SKEW_MS && age <= TRUSTED_DEVICE_MS;
}

export function trustedDeviceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: TRUSTED_DEVICE_MS / 1000,
  };
}
