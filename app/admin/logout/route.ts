import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();

  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };

  cookieStore.set("hm_admin", "", base);
  cookieStore.set("hm_admin_sig", "", base);

  const res = NextResponse.redirect(new URL("/admin?loggedout=1", req.url));
  res.headers.set("Cache-Control", "no-store");
  return res;
}