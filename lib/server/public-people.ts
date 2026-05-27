import { sanitizeAppearances } from "@/app/api/_lib/media";
import type { MediaItem as PublicMediaItem } from "@/components/media/types";
import { getDb } from "@/lib/server/db";

export type PublicPersonIndexItem = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  photoCount: number;
  videoCount: number;
  featuredImage: string | null;
};

export type PublicPersonDetail = PublicPersonIndexItem & {
  mediaItems: PublicMediaItem[];
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function toMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  return {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: normalizeStringArray(doc.tags),
    categories: normalizeStringArray(doc.categories),
    people: normalizeStringArray(doc.people),
    appearances: sanitizeAppearances(doc.appearances),
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : null,
  };
}

function isVideoType(value: unknown) {
  return typeof value === "string" && value === "video";
}

function buildPersonMediaQuery(personId: string, personName: string) {
  const personMatch: Record<string, unknown>[] = [{ peopleIds: personId }];

  if (personName) {
    personMatch.push({ people: personName });
  }

  return {
    $and: [
      { $or: personMatch },
      { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] },
    ],
  };
}

export async function getPublicPeople(): Promise<PublicPersonIndexItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("people_profiles")
    .find({ $or: [{ isPublic: true }, { isPublic: { $exists: false } }] })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = await Promise.all(
    docs.map(async (doc): Promise<PublicPersonIndexItem> => {
      const personId = String(doc._id);
      const name = typeof doc.name === "string" ? doc.name : "";

      const linked = await db
        .collection("media")
        .find(buildPersonMediaQuery(personId, name))
        .project({ _id: 1, type: 1, secureUrl: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();

      const deduped = new Map<string, Record<string, unknown>>();
      for (const item of linked) {
        deduped.set(String(item._id), item as Record<string, unknown>);
      }

      const dedupedItems = Array.from(deduped.values());
      const photoCount = dedupedItems.filter((item) => !isVideoType(item.type)).length;
      const videoCount = dedupedItems.filter((item) => isVideoType(item.type)).length;

      const featuredImage =
        dedupedItems.find(
          (item): item is Record<string, unknown> & { secureUrl: string } =>
            typeof item.secureUrl === "string" && item.secureUrl.trim().length > 0
        )?.secureUrl ?? null;

      return {
        id: personId,
        name,
        slug: typeof doc.slug === "string" ? doc.slug : "",
        bio: typeof doc.bio === "string" ? doc.bio : null,
        avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
        photoCount,
        videoCount,
        featuredImage,
      };
    })
  );

  return items;
}

export async function getPublicPersonBySlug(slug: string): Promise<PublicPersonDetail | null> {
  const db = await getDb();

  const doc = await db.collection("people_profiles").findOne({
    slug,
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  });

  if (!doc) return null;

  const personId = String(doc._id);
  const name = typeof doc.name === "string" ? doc.name : "";

  const mediaDocs = await db
    .collection("media")
    .find(buildPersonMediaQuery(personId, name))
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();

  const deduped = new Map<string, Record<string, unknown>>();
  for (const mediaDoc of mediaDocs) {
    deduped.set(String(mediaDoc._id), mediaDoc as Record<string, unknown>);
  }

  const mediaItems = Array.from(deduped.values()).map((item) => toMediaItem(item));

  return {
    id: personId,
    name,
    slug: typeof doc.slug === "string" ? doc.slug : "",
    bio: typeof doc.bio === "string" ? doc.bio : null,
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    photoCount: mediaItems.filter((item) => item.type !== "video").length,
    videoCount: mediaItems.filter((item) => item.type === "video").length,
    featuredImage: mediaItems.find((item) => typeof item.secureUrl === "string" && item.secureUrl)?.secureUrl ?? null,
    mediaItems,
  };
}