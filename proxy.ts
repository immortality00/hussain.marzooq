import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "hm_admin";
const COOKIE_VALUE = "ok";

function isPublicAdminRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/logout" ||
    pathname === "/admin/logout/"
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow login + logout routes always
  if (isPublicAdminRoute(pathname)) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie === COOKIE_VALUE) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};