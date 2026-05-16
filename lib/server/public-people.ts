import clientPromise from "@/lib/mongodb";
import { sanitizeAppearances } from "@/app/api/_lib/media";
import type { MediaItem as PublicMediaItem } from "@/components/media/types";

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

export async function getPublicPeople(): Promise<PublicPersonIndexItem[]> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("people_profiles")
    .find({ $or: [{ isPublic: true }, { isPublic: { $exists: false } }] })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = await Promise.all(
    docs.map(async (doc) => {
      const name = typeof doc.name === "string" ? doc.name : "";

      const linked = await db
        .collection("media")
        .find({
          people: name,
          $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
        })
        .project({ type: 1, secureUrl: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();

      const photoCount = linked.filter((item) => !isVideoType(item.type)).length;
      const videoCount = linked.filter((item) => isVideoType(item.type)).length;
      const featuredImage =
        linked.find((item) => typeof item.secureUrl === "string")?.secureUrl ?? null;

      return {
        id: String(doc._id),
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
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("people_profiles").findOne({
    slug,
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  });

  if (!doc) return null;

  const name = typeof doc.name === "string" ? doc.name : "";

  const mediaDocs = await db
    .collection("media")
    .find({
      people: name,
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
    })
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();

  const mediaItems = mediaDocs.map((item) => toMediaItem(item as Record<string, unknown>));

  return {
    id: String(doc._id),
    name,
    slug: typeof doc.slug === "string" ? doc.slug : "",
    bio: typeof doc.bio === "string" ? doc.bio : null,
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    photoCount: mediaItems.filter((item) => item.type !== "video").length,
    videoCount: mediaItems.filter((item) => item.type === "video").length,
    featuredImage: mediaItems.find((item) => item.secureUrl)?.secureUrl ?? null,
    mediaItems,
  };
}