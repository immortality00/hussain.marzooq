import { v2 as cloudinary } from "cloudinary";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { isRecord, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isStringOrNumber(v: unknown): v is string | number {
  return typeof v === "string" || typeof v === "number";
}

const BLOCKED_KEYS = new Set([
  "eager",
  "transformation",
  "invalidate",
  "eager_async",
  "eager_notification_url",
]);

function sanitizeFolder(raw: unknown): string {
  const base = "hm_visuals";

  if (typeof raw !== "string") return base;
  const f = raw.trim();

  if (!f.startsWith(base)) return base;
  if (f.includes("..") || f.includes("\\") || f.includes("//")) return base;

  return f.endsWith("/") ? f.slice(0, -1) : f;
}

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const secret = process.env.CLOUDINARY_API_SECRET ?? "";
  if (!secret) {
    return noStoreJson({ error: "Missing CLOUDINARY_API_SECRET" }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return noStoreJson({ error: "Cloudinary config missing" }, { status: 500 });
  }

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const raw = body.paramsToSign;
  if (!isRecord(raw)) {
    return noStoreJson({ error: "Missing paramsToSign" }, { status: 400 });
  }

  const paramsToSign: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (BLOCKED_KEYS.has(k)) continue;
    if (!isStringOrNumber(v)) continue;
    paramsToSign[k] = v;
  }

  paramsToSign.folder = sanitizeFolder(paramsToSign.folder);

  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);
  return noStoreJson({ signature });
}