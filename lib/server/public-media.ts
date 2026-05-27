import { getDb } from "@/lib/server/db";
import {
  buildPublicMediaQuery,
  toPublicMediaItem,
  type PublicMediaItem,
} from "@/lib/server/media-serializers";

async function listPublicMedia({
  type,
  category,
  limit,
}: {
  type: "all" | "image" | "video" | "embed";
  category?: string;
  limit: number;
}) {
  const db = await getDb();

  const docs = await db
    .collection("media")
    .find(buildPublicMediaQuery({ type, category }))
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));
}

export async function getPhotographyItems(): Promise<PublicMediaItem[]> {
  const primary = await listPublicMedia({
    type: "image",
    category: "photography",
    limit: 60,
  });

  if (primary.length) return primary;

  return listPublicMedia({
    type: "image",
    limit: 60,
  });
}

export async function getVideographyItems(): Promise<PublicMediaItem[]> {
  const all = await listPublicMedia({
    type: "all",
    category: "videography",
    limit: 60,
  });

  return all.filter((item) => item.type === "video" || item.type === "embed");
}

export async function getShowreelUrl(): Promise<string | null> {
  const db = await getDb();

  const doc = await db.collection("site_settings").findOne({ key: "showreel" });
  return doc && typeof doc.value === "string" ? doc.value : null;
}