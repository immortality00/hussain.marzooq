import { NextResponse } from "next/server";
import { COOKIE_NAME, HINT_NAME, sessionCookieOptions } from "@/lib/auth/session-token";
import { fromAnotherSite } from "@/lib/auth/same-site";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  if (fromAnotherSite(req)) {
    return NextResponse.json({ ok: false, error: "origin" }, { status: 403, headers: NO_STORE });
  }

  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });

  const cleared = { ...sessionCookieOptions(false), maxAge: 0 };
  res.cookies.set(COOKIE_NAME, "", cleared);
  res.cookies.set(HINT_NAME, "", { ...cleared, httpOnly: false });

  return res;
}
