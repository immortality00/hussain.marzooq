import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "hm_admin";
const SIG_NAME = "hm_admin_sig";
const COOKIE_VALUE = "ok";

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function getAdminCookieNames() {
  return { COOKIE_NAME, SIG_NAME, COOKIE_VALUE };
}

/**
 * Server-runtime check (Route Handlers / Server Components)
 */
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

/**
 * Middleware/Edge check (no node crypto).
 * We'll validate signature in middleware using Web Crypto there.
 */
export function isAdminAuthedRequest(req: NextRequest, expectedSig: string): boolean {
  const v = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const sig = req.cookies.get(SIG_NAME)?.value ?? "";
  return v === COOKIE_VALUE && sig === expectedSig;
}