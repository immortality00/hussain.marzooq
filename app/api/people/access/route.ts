import { cookies } from "next/headers";
import { getDb } from "@/lib/server/db";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import {
  createPersonGateCookieValue,
  getPersonGateSecret,
  personGateCookieName,
  verifyPassword,
} from "@/lib/password-gate";
import {
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const ACCESS_ATTEMPT_LIMIT = 5;
const ACCESS_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const slug = (asNullableString(body.slug) ?? "").trim();
  const password = (asNullableString(body.password) ?? "").trim();

  if (!slug || !password) {
    return noStoreJson({ ok: false, error: "Slug and password are required." }, { status: 400 });
  }

  const rateLimitKey = `${slug}:${getClientAddress(req)}`;
  const currentLimit = await getFixedWindowRateLimitStatus({
    bucket: "person-access",
    key: rateLimitKey,
    limit: ACCESS_ATTEMPT_LIMIT,
  });

  if (currentLimit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many wrong attempts. Try again later." },
      { status: 429 }
    );
  }

  const db = await getDb();
  const doc = await db.collection("people_profiles").findOne({ slug });

  if (!doc || doc.isPublic === false || doc.isPrivate !== true) {
    return noStoreJson({ ok: false, error: "Profile not found." }, { status: 404 });
  }

  const passwordHash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const secret = getPersonGateSecret();

  const ok = !!passwordHash && (await verifyPassword(password, passwordHash));

  if (!ok) {
    await consumeFixedWindowRateLimit({
      bucket: "person-access",
      key: rateLimitKey,
      limit: ACCESS_ATTEMPT_LIMIT,
      windowMs: ACCESS_ATTEMPT_WINDOW_MS,
    });
    return noStoreJson({ ok: false, error: "Wrong password." }, { status: 403 });
  }

  const cookieValue = createPersonGateCookieValue(secret, String(doc._id), accessToken);
  if (!cookieValue) {
    return noStoreJson(
      { ok: false, error: "Private profile access is not configured." },
      { status: 500 }
    );
  }

  await clearFixedWindowRateLimit({ bucket: "person-access", key: rateLimitKey });

  const jar = await cookies();
  jar.set(personGateCookieName(String(doc._id)), cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return noStoreJson({ ok: true });
}
