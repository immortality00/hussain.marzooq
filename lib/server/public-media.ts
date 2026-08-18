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

export type ExhibitionCity = {
  locationId: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  works: PublicMediaItem[];
};

export async function getExhibitionCities(): Promise<ExhibitionCity[]> {
  const db = await getDb();

  const docs = await db
    .collection("media")
    .find({
      $and: [
        buildPublicMediaQuery({ type: "all" }),
        { appearances: { $elemMatch: { kind: "exhibited" } } },
      ],
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(500)
    .toArray();

  const byLocation = new Map<string, ExhibitionCity>();

  for (const doc of docs) {
    const item = toPublicMediaItem(doc as Record<string, unknown>);

    for (const appearance of item.appearances) {
      if (
        appearance.kind !== "exhibited" ||
        !appearance.locationId ||
        appearance.lat === null ||
        appearance.lon === null
      ) {
        continue;
      }

      const existing = byLocation.get(appearance.locationId);
      if (existing) {
        existing.works.push(item);
      } else {
        byLocation.set(appearance.locationId, {
          locationId: appearance.locationId,
          city: appearance.city,
          country: appearance.country,
          lat: appearance.lat,
          lon: appearance.lon,
          works: [item],
        });
      }
    }
  }

  return Array.from(byLocation.values()).sort(
    (a, b) => b.works.length - a.works.length
  );
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