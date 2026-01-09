import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();

  cookieStore.set("hm_admin", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  // Redirect to a *different* URL to avoid Router Cache showing stale admin UI
  const res = NextResponse.redirect(new URL("/admin?loggedout=1", req.url));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
