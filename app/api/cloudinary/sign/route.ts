import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
});

function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const timestamp = Math.round(Date.now() / 1000);

  // Locked to hm_visuals folder
  const folder = "hm_visuals";

  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  if (!apiSecret) {
    return noStoreJson({ ok: false, error: "Missing CLOUDINARY_API_SECRET" }, { status: 500 });
  }

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return noStoreJson({
    ok: true,
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    folder,
  });
}