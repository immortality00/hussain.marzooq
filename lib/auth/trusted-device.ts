import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const TRUSTED_DEVICE_COOKIE = "hm_admin_device";
export const TRUSTED_DEVICE_MS = 365 * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

function deviceKey(secret: string) {
  return createHmac("sha256", secret).update("hm-trusted-device").digest();
}

function sign(secret: string, payload: string) {
  return createHmac("sha256", deviceKey(secret)).update(payload).digest("hex");
}

export function issueTrustedDevice(secret: string, now: number = Date.now()) {
  const payload = `v1.${now}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(secret, payload)}`;
}

export function isTrustedDevice(value: string | undefined, secret: string, now: number = Date.now()) {
  if (!value || !secret || value.length > 200) return false;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || !/^\d{1,15}$/.test(parts[1])) return false;

  const expected = Buffer.from(sign(secret, parts.slice(0, 3).join(".")));
  const given = Buffer.from(parts[3]);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;

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
