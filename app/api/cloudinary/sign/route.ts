import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("hm_admin")?.value === "ok";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = Math.round(Date.now() / 1000);

  // You can restrict uploads further later (folder, tags, etc.)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "hm_visuals" },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: "hm_visuals",
  });
}
