import { NextResponse } from "next/server";
import { COOKIE_NAME, SIG_NAME } from "@/lib/auth/session-token";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/admin?loggedout=1", req.url));
  res.headers.set("Cache-Control", "no-store");

  const options = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };

  res.cookies.set(COOKIE_NAME, "", options);
  res.cookies.set(SIG_NAME, "", options);

  return res;
}
