import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  HINT_NAME,
  SIG_NAME,
  createSessionValue,
  parseSession,
  safeEqual,
  sessionCookieMaxAge,
  sessionFailure,
  shouldRenewSession,
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

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(signature);
}

type AuthResult =
  | {
      ok: true;
      remember: boolean;
      renewWith: { value: string; signature: string; remember: boolean } | null;
    }
  | { ok: false; reason: "missing" | "malformed" | "expired" | "future" | "signature" | "config" };

async function checkAdminAuth(req: NextRequest): Promise<AuthResult> {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) return { ok: false, reason: "config" };

  const value = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const signature = req.cookies.get(SIG_NAME)?.value ?? "";
  if (!value || !signature) return { ok: false, reason: "missing" };

  const failure = sessionFailure(value);
  if (failure) return { ok: false, reason: failure };

  const expected = await signValue(value, secret);
  if (!safeEqual(signature, expected)) return { ok: false, reason: "signature" };

  const session = parseSession(value);
  const remember = session?.remember ?? false;
  if (session && shouldRenewSession(value)) {
    const fresh = createSessionValue(session.remember, Date.now(), session.startedAt);
    return {
      ok: true,
      remember,
      renewWith: {
        value: fresh,
        signature: await signValue(fresh, secret),
        remember: session.remember,
      },
    };
  }

  return { ok: true, remember, renewWith: null };
}

function cookieOptions(remember: boolean, httpOnly: boolean) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookieMaxAge(remember),
  };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (isPublicAdminRoute(pathname)) return NextResponse.next();

  const auth = await checkAdminAuth(req);

  if (auth.ok) {
    const res = NextResponse.next();
    if (auth.renewWith) {
      const options = cookieOptions(auth.renewWith.remember, true);
      res.cookies.set(COOKIE_NAME, auth.renewWith.value, options);
      res.cookies.set(SIG_NAME, auth.renewWith.signature, options);
    }
    if (auth.renewWith || !req.cookies.has(HINT_NAME)) {
      res.cookies.set(HINT_NAME, "1", cookieOptions(auth.remember, false));
    }
    return res;
  }

  console.warn(`[admin-auth] signed out on ${pathname}: ${auth.reason}`);

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
