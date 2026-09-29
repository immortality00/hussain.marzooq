import { NextResponse } from "next/server";
import { COOKIE_NAME, HINT_NAME, sessionCookieOptions } from "@/lib/auth/session-token";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin?loggedout=1", req.url), 303);
  res.headers.set("Cache-Control", "no-store");

  const cleared = { ...sessionCookieOptions(false), maxAge: 0 };
  res.cookies.set(COOKIE_NAME, "", cleared);
  res.cookies.set(HINT_NAME, "", { ...cleared, httpOnly: false });

  return res;
}
