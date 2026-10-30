import { getDb } from "@/lib/server/db";
import { toPublicMediaItem } from "@/lib/server/media-serializers";
import { disciplineMatch } from "@/lib/server/public-media-tags";
import { buildFallback } from "@/lib/server/public-read";
import type { SitemapPhoto } from "@/lib/sitemap-images";

// Every photo /photography and its tag pages can show — the same match as those pages,
// newest first, as they list them.
export async function getPhotographySitemapPhotos(): Promise<SitemapPhoto[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("media")
      .find(disciplineMatch("photography", "image"), {
        projection: { secureUrl: 1, asset: 1, tags: 1, createdAt: 1 },
      })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const photos: SitemapPhoto[] = [];
    for (const doc of docs) {
      const item = toPublicMediaItem(doc as Record<string, unknown>);
      if (item.secureUrl) photos.push({ url: item.secureUrl, tags: item.tags });
    }
    return photos;
  } catch (error) {
    return buildFallback(error, []);
  }
}
