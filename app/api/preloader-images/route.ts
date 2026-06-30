import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";

const DISCIPLINES = [
  { key: "photography", category: "photography" },
  { key: "videography", category: "videography" },
  { key: "nft", category: "nft" },
  { key: "dancing", category: "dancing" },
  { key: "web", category: "web-development" },
] as const;

export async function GET() {
  try {
    const db = await getDb();
    const results: { discipline: string; url: string }[] = [];

    for (const { key, category } of DISCIPLINES) {
      const doc = await db
        .collection("media")
        .findOne(
          { ...buildPublicMediaQuery({ type: "image", category }), secureUrl: { $exists: true, $ne: null } },
          { sort: { createdAt: -1 }, projection: { secureUrl: 1 } }
        );
      if (doc?.secureUrl) {
        results.push({ discipline: key, url: doc.secureUrl as string });
      }
    }

    return NextResponse.json({ images: results });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
