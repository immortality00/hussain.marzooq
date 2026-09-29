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

// Edge runtime: Web Crypto only. Do not import node:crypto here.

function isPublicAdminRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/logout" ||
    pathname === "/admin/logout/"
  );
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
  if (isPublicAdminRoute(pathname)) return NextResponse.next();

  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
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

  if ((req.headers.get("sec-fetch-mode") ?? "navigate") !== "navigate") {
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
