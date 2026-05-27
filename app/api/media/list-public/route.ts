import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import {
  buildPublicMediaQuery,
  toPublicMediaItem,
} from "@/lib/server/media-serializers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category")?.trim() ?? null;
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 24), 1), 60);

  const db = await getDb();

  const docs = await db
    .collection("media")
    .find(buildPublicMediaQuery({ type, category }))
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const items = docs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));

  return noStoreJson({ items });
}