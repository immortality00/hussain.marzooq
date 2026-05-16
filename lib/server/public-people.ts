import clientPromise from "@/lib/mongodb";
import type { PublicMediaItem } from "./public-media";
import { sanitizeAppearances } from "@/app/api/_lib/media";

export type PublicPersonIndexItem = {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  aliases: string[];
  avatarUrl: string | null;
  coverUrl: string | null;
  mediaCount: number;
  featuredImage: string | null;
};

export type PublicPersonDetail = PublicPersonIndexItem & {
  mediaItems: PublicMediaItem[];
};

function toMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  return {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: Array.isArray(doc.tags) ? doc.tags.filter((x): x is string => typeof x === "string") : [],
    categories: Array.isArray(doc.categories) ? doc.categories.filter((x): x is string => typeof x === "string") : [],
    people: Array.isArray(doc.people) ? doc.people.filter((x): x is string => typeof x === "string") : [],
    appearances: sanitizeAppearances(doc.appearances),
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : typeof doc.createdAt === "string" ? doc.createdAt : null,
  };
}

function getCandidates(name: string, aliases: string[]) {
  return Array.from(new Set([name.trim(), ...aliases.map((x) => x.trim())].filter(Boolean)));
}

function mapPerson(doc: Record<string, unknown>, mediaCount: number, featuredImage: string | null): PublicPersonIndexItem {
  return {
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    headline: typeof doc.headline === "string" ? doc.headline : null,
    bio: typeof doc.bio === "string" ? doc.bio : null,
    aliases: Array.isArray(doc.aliases) ? doc.aliases.filter((x): x is string => typeof x === "string") : [],
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    coverUrl: typeof doc.coverUrl === "string" ? doc.coverUrl : null,
    mediaCount,
    featuredImage,
  };
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
      const aliases = Array.isArray(doc.aliases) ? doc.aliases.filter((x): x is string => typeof x === "string") : [];
      const candidates = getCandidates(name, aliases);

      const mediaDocs = await db
        .collection("media")
        .find({
          people: { $in: candidates },
          $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const mediaCount = await db.collection("media").countDocuments({
        people: { $in: candidates },
        $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
      });

      const featuredImage =
        mediaDocs.length > 0 && typeof mediaDocs[0].secureUrl === "string"
          ? mediaDocs[0].secureUrl
          : null;

      return mapPerson(doc as Record<string, unknown>, mediaCount, featuredImage);
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
  const aliases = Array.isArray(doc.aliases) ? doc.aliases.filter((x): x is string => typeof x === "string") : [];
  const candidates = getCandidates(name, aliases);

  const mediaDocs = await db
    .collection("media")
    .find({
      people: { $in: candidates },
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
    })
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();

  const mediaItems = mediaDocs.map((item) => toMediaItem(item as Record<string, unknown>));
  const featuredImage = mediaItems.find((x) => x.secureUrl)?.secureUrl ?? null;

  return {
    ...mapPerson(doc as Record<string, unknown>, mediaItems.length, featuredImage),
    mediaItems,
  };
}