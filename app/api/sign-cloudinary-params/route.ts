import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isStringOrNumber(v: unknown): v is string | number {
  return typeof v === "string" || typeof v === "number";
}

// Do NOT sign these (avoid expensive/dangerous payloads)
const BLOCKED_KEYS = new Set([
  "eager",
  "transformation",
  "invalidate",
  "eager_async",
  "eager_notification_url",
]);

function sanitizeFolder(raw: unknown): string {
  // default safe base
  const base = "hm_visuals";

  if (typeof raw !== "string") return base;
  const f = raw.trim();

  // Allow:
  // - hm_visuals
  // - hm_visuals/services
  // - hm_visuals/media
  // (any subfolder under hm_visuals)
  if (!f.startsWith(base)) return base;

  // block path traversal / weird separators
  if (f.includes("..") || f.includes("\\") || f.includes("//")) return base;

  // normalize trailing slash
  return f.endsWith("/") ? f.slice(0, -1) : f;
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const secret = process.env.CLOUDINARY_API_SECRET ?? "";
  if (!secret) {
    return noStore({ error: "Missing CLOUDINARY_API_SECRET" }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return noStore({ error: "Cloudinary config missing" }, { status: 500 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const raw = body.paramsToSign;
  if (!isRecord(raw)) {
    return noStore({ error: "Missing paramsToSign" }, { status: 400 });
  }

  // sanitize allowed params
  const paramsToSign: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (BLOCKED_KEYS.has(k)) continue;
    if (!isStringOrNumber(v)) continue;
    paramsToSign[k] = v;
  }

  // ✅ allow safe subfolders under hm_visuals (fixes services upload)
  paramsToSign.folder = sanitizeFolder(paramsToSign.folder);

  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);
  return noStore({ signature });
}