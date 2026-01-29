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

// Block expensive / dangerous signing keys
const BLOCKED_KEYS = new Set([
  "eager",
  "transformation",
  "invalidate",
  "eager_async",
  "eager_notification_url",
]);

export async function POST(request: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await request.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const raw = body.paramsToSign;
  if (!isRecord(raw)) {
    const res = NextResponse.json({ error: "Missing paramsToSign" }, { status: 400 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // Sanitize
  const paramsToSign: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (BLOCKED_KEYS.has(k)) continue;
    if (!isStringOrNumber(v)) continue;
    paramsToSign[k] = v;
  }

  // Enforce uploads only to folder "hm_visuals"
  if ("folder" in paramsToSign && paramsToSign.folder !== "hm_visuals") {
    const res = NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  paramsToSign.folder = "hm_visuals";

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET ?? ""
  );

  const res = NextResponse.json({ signature });
  res.headers.set("Cache-Control", "no-store");
  return res;
}