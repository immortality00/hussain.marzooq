import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  HINT_NAME,
  issueSessionCookie,
  readSessionCookie,
  sessionCookieOptions,
  type SessionCheck,
} from "@/lib/auth/session-token";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";

// Edge runtime: Web Crypto only. Do not import node:crypto here.

function isPageLoad(req: NextRequest) {
  const mode = req.headers.get("sec-fetch-mode");
  return !mode || mode === "navigate" || req.headers.get("sec-fetch-dest") === "document";
}

function isSignInPage(pathname: string) {
  return pathname === "/admin" || pathname === "/admin/";
}

function isPublicAdminRoute(pathname: string) {
  return isSignInPage(pathname) || pathname === "/admin/logout" || pathname === "/admin/logout/";
}

function wantsSignInForm(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  return req.method !== "GET" || params.has("loggedout") || params.has("signedout");
}

type AuthResult = SessionCheck | { ok: false; reason: "missing" | "config" };

async function checkAdminAuth(req: NextRequest, secret: string): Promise<AuthResult> {
  if (!secret) return { ok: false, reason: "config" };

  const cookie = req.cookies.get(COOKIE_NAME)?.value ?? "";
  if (!cookie) return { ok: false, reason: "missing" };

  return readSessionCookie(cookie, secret);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();

  if (isPublicAdminRoute(pathname)) {
    if (!isSignInPage(pathname) || wantsSignInForm(req)) return NextResponse.next();
    const signedIn = await checkAdminAuth(req, secret);
    if (!signedIn.ok) return NextResponse.next();
    const url = req.nextUrl.clone();
    const target = new URL(safeAdminNextPath(req.nextUrl.searchParams.get("next")), url);
    url.pathname = target.pathname;
    url.search = target.search;
    return NextResponse.redirect(url);
  }

  const auth = await checkAdminAuth(req, secret);

  if (auth.ok) {
    const { remember, startedAt } = auth.session;
    const res = NextResponse.next();
    if (auth.renew) {
      const fresh = await issueSessionCookie(secret, remember, startedAt);
      res.cookies.set(COOKIE_NAME, fresh, sessionCookieOptions(remember));
    }
    if (auth.renew || !req.cookies.has(HINT_NAME)) {
      res.cookies.set(HINT_NAME, "1", sessionCookieOptions(remember, false));
    }
    return res;
  }

  console.warn(`[admin-auth] signed out on ${pathname}: ${auth.reason}`);

  if (!isPageLoad(req)) {
    return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin";
  url.search = "";
  url.searchParams.set("next", pathname);
  if (auth.reason !== "missing") url.searchParams.set("signedout", auth.reason);
  const res = NextResponse.redirect(url);
  if (req.cookies.has(HINT_NAME)) res.cookies.delete(HINT_NAME);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
