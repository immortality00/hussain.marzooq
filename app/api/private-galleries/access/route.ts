import { cookies } from "next/headers";
import { getDb } from "@/lib/server/db";
import {
  createPrivateGalleryCookieValue,
  getPrivateGalleryExpiryDate,
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyGalleryPassword,
} from "@/lib/private-galleries";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import {
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const ACCESS_ATTEMPT_LIMIT = 5;
const ACCESS_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

function buildAccessRateLimitKey(req: Request, slug: string) {
  return `${slug}:${getClientAddress(req)}`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const slug = (asNullableString(body.slug) ?? "").trim();
  const password = (asNullableString(body.password) ?? "").trim();

  if (!slug || !password) {
    return noStoreJson(
      { ok: false, error: "Slug and password are required." },
      { status: 400 }
    );
  }

  const rateLimitKey = buildAccessRateLimitKey(req, slug);
  const currentLimit = await getFixedWindowRateLimitStatus({
    bucket: "private-gallery-access",
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

  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc) {
    return noStoreJson({ ok: false, error: "Gallery not found." }, { status: 404 });
  }

  if (isPrivateGalleryUnavailable(doc as Record<string, unknown>)) {
    return noStoreJson({ ok: false, error: "This gallery is unavailable." }, { status: 403 });
  }

  const passwordHash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const ok = await verifyGalleryPassword(password, passwordHash);

  if (!ok) {
    await consumeFixedWindowRateLimit({
      bucket: "private-gallery-access",
      key: rateLimitKey,
      limit: ACCESS_ATTEMPT_LIMIT,
      windowMs: ACCESS_ATTEMPT_WINDOW_MS,
    });

    return noStoreJson({ ok: false, error: "Wrong password." }, { status: 403 });
  }

  const galleryId = String(doc._id);
  const cookieValue = createPrivateGalleryCookieValue(galleryId, accessToken);
  if (!cookieValue) {
    return noStoreJson({ ok: false, error: "Private gallery access is not configured." }, { status: 500 });
  }

  await clearFixedWindowRateLimit({ bucket: "private-gallery-access", key: rateLimitKey });

  const expiresAt = getPrivateGalleryExpiryDate(doc as Record<string, unknown>);
  const jar = await cookies();
  jar.set(privateGalleryCookieName(galleryId), cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt ?? undefined,
  });

  return noStoreJson({ ok: true });
}