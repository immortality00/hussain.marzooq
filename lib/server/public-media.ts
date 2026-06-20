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
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));
}

export async function getPhotographyItems(): Promise<PublicMediaItem[]> {
  return listPublicMedia({
    type: "image",
    category: "photography",
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

export async function getShowreelItem(): Promise<PublicMediaItem | null> {
  const db = await getDb();

  const doc = await db
    .collection("media")
    .find({
      $and: [
        buildPublicMediaQuery({ type: "all", category: "showreel" }),
        { type: { $in: ["video", "embed"] } },
      ],
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(1)
    .next();

  return doc ? toPublicMediaItem(doc as Record<string, unknown>) : null;
}

export async function getShowreelUrl(): Promise<string | null> {
  const item = await getShowreelItem();
  return item?.embedUrl ?? item?.secureUrl ?? null;
}