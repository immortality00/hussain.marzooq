import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "hm_admin";
const SIG_NAME = "hm_admin_sig";
const COOKIE_VALUE = "ok";

async function hmacHex(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Next.js 16: must export a single function named `proxy` (or default export)
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Always allow the login page (both variants) and logout route
  if (pathname === "/admin" || pathname === "/admin/") return NextResponse.next();
  if (pathname === "/admin/logout" || pathname === "/admin/logout/") return NextResponse.next();

  // Only run auth for /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const secret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  const v = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const sig = req.cookies.get(SIG_NAME)?.value ?? "";
  const expected = await hmacHex(COOKIE_VALUE, secret);

  if (v === COOKIE_VALUE && sig === expected) return NextResponse.next();

  // Not authed → redirect to login (preserve next)
  const url = req.nextUrl.clone();
  url.pathname = "/admin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};