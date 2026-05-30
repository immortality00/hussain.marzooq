import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "hm_admin";
const SIG_NAME = "hm_admin_sig";
const COOKIE_VALUE = "ok";
const SCRYPT_KEYLEN = 64;

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function timingSafeEqualString(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function parseScryptHash(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return null;

  try {
    const salt = Buffer.from(parts[1], "base64");
    const hash = Buffer.from(parts[2], "base64");

    if (salt.length === 0 || hash.length === 0) return null;
    return { salt, hash };
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string) {
  const hashValue = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();

  if (hashValue) {
    const parsed = parseScryptHash(hashValue);
    if (!parsed) return false;

    const derivedKey = crypto.scryptSync(password, parsed.salt, parsed.hash.length || SCRYPT_KEYLEN);
    return crypto.timingSafeEqual(derivedKey, parsed.hash);
  }

  const expectedRaw = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!expectedRaw) return false;
  return timingSafeEqualString(password, expectedRaw);
}

export function isAdminPasswordConfigured() {
  return Boolean(
    (process.env.ADMIN_PASSWORD_HASH ?? "").trim() || (process.env.ADMIN_PASSWORD ?? "").trim()
  );
}

export function getAdminCookieNames() {
  return { COOKIE_NAME, SIG_NAME, COOKIE_VALUE };
}

export async function isAdminAuthedServer(): Promise<boolean> {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) return false;

  const jar = await cookies();
  const v = jar.get(COOKIE_NAME)?.value ?? "";
  const sig = jar.get(SIG_NAME)?.value ?? "";

  if (v !== COOKIE_VALUE) return false;
  const expected = hmacHex(COOKIE_VALUE, secret);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function requireAdminOr401() {
  const ok = await isAdminAuthedServer();
  if (!ok) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function isAdminAuthedRequest(req: NextRequest, expectedSig: string): boolean {
  const v = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const sig = req.cookies.get(SIG_NAME)?.value ?? "";
  return v === COOKIE_VALUE && sig === expectedSig;
}