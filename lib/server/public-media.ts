import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/server/db";
import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
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

// A single, consistent gallery pool for the page transition — recent public
// photos, sized down for the grid. Used on every page so the transition reads
// the same everywhere instead of depending on the current page's own images.
export const getTransitionImages = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const items = await listPublicMedia({ type: "image", limit: 24 });
      return items
        .map((item) => item.secureUrl)
        .filter((url): url is string => Boolean(url))
        .map((url) => cloudinaryImageLoader({ src: url, width: 400 }));
    } catch {
      // Root layout depends on this — never let a failed query break every page.
      return [];
    }
  },
  ["transition-images"],
  { revalidate: 300 },
);

export async function getPhotographyItems(): Promise<PublicMediaItem[]> {
  try {
    return await listPublicMedia({
      type: "image",
      category: "photography",
      limit: 60,
    });
  } catch {
    return [];
  }
}

export async function getVideographyItems(): Promise<PublicMediaItem[]> {
  try {
    const all = await listPublicMedia({
      type: "all",
      category: "videography",
      limit: 60,
    });

    return all.filter((item) => item.type === "video" || item.type === "embed");
  } catch {
    return [];
  }
}

async function getMediaByTagImpl({
  category,
  mediaMode,
  tagSlug,
  limit = 60,
}: {
  category: string;
  mediaMode: "image" | "video";
  tagSlug: string;
  limit?: number;
}): Promise<PublicMediaItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("media")
    .find({
      $and: [
        buildPublicMediaQuery({
          type: mediaMode === "image" ? "image" : "all",
          category,
        }),
        { tags: tagSlug },
        ...(mediaMode === "video" ? [{ type: { $in: ["video", "embed"] } }] : []),
      ],
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));
}

export async function getMediaByTag(args: {
  category: string;
  mediaMode: "image" | "video";
  tagSlug: string;
  limit?: number;
}): Promise<PublicMediaItem[]> {
  try {
    return await getMediaByTagImpl(args);
  } catch {
    return [];
  }
}

export type ExhibitionCity = {
  locationId: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  works: PublicMediaItem[];
};

async function getExhibitionCitiesImpl(): Promise<ExhibitionCity[]> {
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

export async function getExhibitionCities(): Promise<ExhibitionCity[]> {
  try {
    return await getExhibitionCitiesImpl();
  } catch {
    return [];
  }
}

export async function getShowreelItem(): Promise<PublicMediaItem | null> {
  try {
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
  } catch {
    return null;
  }
}