import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { verifyGalleryPassword, privateGalleryCookieName } from "@/lib/private-galleries";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function getExpiryDate(doc: Record<string, unknown>) {
  if (doc.expiresAtUtc instanceof Date) return doc.expiresAtUtc;
  if (doc.expiresAt instanceof Date) return doc.expiresAt;
  return null;
}

function isSecureRequest(req: Request) {
  const url = new URL(req.url);
  if (url.protocol === "https:") return true;

  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto && forwardedProto.toLowerCase().includes("https")) return true;

  return false;
}

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

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc) {
    return noStoreJson({ ok: false, error: "Gallery not found." }, { status: 404 });
  }

  const isActive = typeof doc.isActive === "boolean" ? doc.isActive : true;
  const expiresAt = getExpiryDate(doc as Record<string, unknown>);

  if (!isActive || (expiresAt && expiresAt.getTime() <= Date.now())) {
    return noStoreJson({ ok: false, error: "This gallery is unavailable." }, { status: 403 });
  }

  const passwordHash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const ok = await verifyGalleryPassword(password, passwordHash);

  if (!ok) {
    return noStoreJson({ ok: false, error: "Wrong password." }, { status: 403 });
  }

  const jar = await cookies();
  jar.set(privateGalleryCookieName(String(doc._id)), accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    expires: expiresAt ?? undefined,
  });

  return noStoreJson({ ok: true });
}