import { noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { getDb } from "@/lib/server/db";
import { UPLOAD_SESSION_COOKIE, createUploadSession } from "@/lib/server/testimonial-upload-sessions";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

export async function POST(request: Request) {
  const clientKey = getClientAddress(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-upload-session",
    key: clientKey,
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many upload sessions. Try again later." },
      { status: 429 }
    );
  }

  const db = await getDb();
  const session = await createUploadSession(db);

  const response = noStoreJson({ ok: true, sessionId: session.sessionId });

  response.cookies.set({
    name: UPLOAD_SESSION_COOKIE,
    value: session.cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAgeSeconds,
  });

  return response;
}
