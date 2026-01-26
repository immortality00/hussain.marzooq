import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "hm_admin";
const SIG_NAME = "hm_admin_sig";
const COOKIE_VALUE = "ok";

async function hmacHexEdge(message: string, secret: string) {
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin except /admin itself (login)
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin") return NextResponse.next();

  const secret = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  if (!secret) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  const v = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const sig = req.cookies.get(SIG_NAME)?.value ?? "";
  const expected = await hmacHexEdge(COOKIE_VALUE, secret);

  if (v === COOKIE_VALUE && sig === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};