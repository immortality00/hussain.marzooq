import { NextResponse } from "next/server";
import type { LoginRefusal } from "@/lib/auth/admin-login";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { PENDING_SIGN_IN_COOKIE, pendingCookieOptions, readSignInRequest } from "@/lib/server/sign-in-requests";

export const NO_STORE = { "Cache-Control": "no-store" };

export function readCookie(req: Request, name: string) {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

export function refuse(error: LoginRefusal, status: number) {
  return NextResponse.json({ ok: false, error }, { status, headers: NO_STORE });
}

export function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { headers: NO_STORE });
}

export function clearPending(res: NextResponse) {
  res.cookies.set(PENDING_SIGN_IN_COOKIE, "", pendingCookieOptions(0));
  return res;
}

/** The second-step request this browser opened with the right password, or null when it is gone. */
export function pendingRequest(req: Request) {
  return readSignInRequest(readCookie(req, PENDING_SIGN_IN_COOKIE));
}

export function expired() {
  return clearPending(refuse("expired", 401));
}

export async function limited(req: Request, bucket: string, limit: number, windowMs: number) {
  const result = await consumeFixedWindowRateLimit({ bucket, key: getClientAddress(req.headers), limit, windowMs });
  return result.limited;
}
