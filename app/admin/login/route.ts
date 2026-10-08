import { NextResponse, after } from "next/server";
import { createAdminSessionCookies, isAdminPasswordConfigured, verifyAdminPassword } from "@/lib/auth/admin";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import type { LoginRefusal } from "@/lib/auth/admin-login";
import { fromAnotherSite } from "@/lib/auth/same-site";
import { clearFixedWindowRateLimit, consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import {
  TRUSTED_DEVICE_COOKIE,
  isTrustedDevice,
  issueTrustedDevice,
  trustedDeviceCookieOptions,
} from "@/lib/auth/trusted-device";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const SITE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SITE_ATTEMPTS = 30;
const NO_STORE = { "Cache-Control": "no-store" };

function readCookie(req: Request, name: string) {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

function refuse(error: LoginRefusal, status: number) {
  return NextResponse.json({ ok: false, error }, { status, headers: NO_STORE });
}

export async function POST(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);

  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!isAdminPasswordConfigured() || !secret) return refuse("config", 503);

  const form = await req.formData().catch(() => null);
  const password = String(form?.get("password") ?? "").trim();
  const remember = form?.get("remember") === "on";
  const next = safeAdminNextPath(String(form?.get("next") ?? ""));

  const limit = { bucket: "admin-login", key: getClientAddress(req.headers) };
  const rateLimit = await consumeFixedWindowRateLimit({
    ...limit,
    limit: MAX_LOGIN_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
  });
  if (rateLimit.limited) return refuse("locked", 429);

  if (!isTrustedDevice(readCookie(req, TRUSTED_DEVICE_COOKIE), secret)) {
    const siteLimit = await consumeFixedWindowRateLimit({
      bucket: "admin-login-site",
      key: "all",
      limit: MAX_SITE_ATTEMPTS,
      windowMs: SITE_WINDOW_MS,
    });
    if (siteLimit.limited) return refuse("locked", 429);
  }
  if (!verifyAdminPassword(password)) return refuse("wrong", 401);

  after(() => clearFixedWindowRateLimit(limit));

  const res = NextResponse.json({ ok: true, next }, { headers: NO_STORE });
  for (const cookie of await createAdminSessionCookies(secret, remember)) {
    res.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  res.cookies.set(TRUSTED_DEVICE_COOKIE, issueTrustedDevice(secret), trustedDeviceCookieOptions());
  return res;
}
