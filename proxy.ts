import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  SIG_NAME,
  isSessionValueFresh,
  safeEqual,
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

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) return false;

  const value = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const signature = req.cookies.get(SIG_NAME)?.value ?? "";
  if (!value || !signature) return false;

  // Expiry is checked before the HMAC so stale tokens are rejected outright.
  if (!isSessionValueFresh(value)) return false;

  const expected = await signValue(value, secret);
  return safeEqual(signature, expected);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (isPublicAdminRoute(pathname)) return NextResponse.next();

  if (await isAdminAuthed(req)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
