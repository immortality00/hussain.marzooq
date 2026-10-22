import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { after } from "next/server";
import {
  adminCookieSecret,
  isAdminPasswordConfigured,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import { fromAnotherSite } from "@/lib/auth/same-site";
import { TRUSTED_DEVICE_COOKIE, isTrustedDevice } from "@/lib/auth/trusted-device";
import { deviceLabelOf } from "@/lib/device-label";
import { readSessionGeneration } from "@/lib/server/admin-security";
import { countPasskeys } from "@/lib/server/passkeys";
import { clearFixedWindowRateLimit, consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { PENDING_SIGN_IN_COOKIE, openSignInRequest, pendingCookieOptions } from "@/lib/server/sign-in-requests";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { json, readCookie, refuse } from "./_lib/respond";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const SITE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SITE_ATTEMPTS = 30;

async function handlePOST(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);

  const secret = adminCookieSecret();
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

  const generation = await readSessionGeneration();
  const trusted = isTrustedDevice(readCookie(req, TRUSTED_DEVICE_COOKIE), secret, generation);
  if (!trusted) {
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

  // No passkey yet means no second step to ask for: the password alone signs in until the first one is added.
  if (trusted || (await countPasskeys()) === 0) {
    const res = json({ ok: true, next });
    await setAdminSession(res, { remember, generation });
    return res;
  }

  const device = deviceLabelOf(req.headers.get("user-agent"));
  const res = json({ ok: true, step: "second" });
  res.cookies.set(PENDING_SIGN_IN_COOKIE, await openSignInRequest({ remember, next, device }), pendingCookieOptions());
  return res;
}

export const POST = withRouteErrors(handlePOST);
