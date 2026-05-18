import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { privateGalleryCookieName } from "@/lib/private-galleries";
import type { MediaItem } from "@/components/media/types";
import { sanitizeAppearances } from "@/app/api/_lib/media";

export type PrivateGallerySummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mediaCount: number;
  isActive: boolean;
  expiresAtLocal: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PrivateGalleryPublic = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  expiresAtLocal: string;
  mediaItems: MediaItem[];
  downloadToken: string;
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function toMediaItem(doc: Record<string, unknown>): MediaItem {
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

function getExpiryDate(doc: Record<string, unknown>) {
  if (doc.expiresAtUtc instanceof Date) return doc.expiresAtUtc;
  if (doc.expiresAt instanceof Date) return doc.expiresAt;
  return null;
}

function isExpired(expiresAt: Date | null | undefined) {
  return !!expiresAt && expiresAt.getTime() <= Date.now();
}

export async function getPrivateGalleryAdminList(): Promise<PrivateGallerySummary[]> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db.collection("private_galleries").find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    description: typeof doc.description === "string" ? doc.description : null,
    mediaCount: Array.isArray(doc.mediaIds) ? doc.mediaIds.length : 0,
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    expiresAtLocal: typeof doc.expiresAtLocal === "string" ? doc.expiresAtLocal : "",
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  }));
}

export async function getPrivateGalleryById(id: string) {
  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const oid = new ObjectId(id);

  const doc = await db.collection("private_galleries").findOne({ _id: oid });
  if (!doc) return null;

  return {
    id: String(doc._id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    description: typeof doc.description === "string" ? doc.description : null,
    mediaIds: normalizeStringArray(doc.mediaIds),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    expiresAtLocal: typeof doc.expiresAtLocal === "string" ? doc.expiresAtLocal : "",
  };
}

export async function getPrivateGalleryPublicBySlug(slug: string): Promise<
  | { state: "missing" }
  | { state: "locked"; id: string; title: string; slug: string; description: string | null; expiresAtLocal: string }
  | { state: "open"; gallery: PrivateGalleryPublic }
> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc) return { state: "missing" };

  const id = String(doc._id);
  const title = typeof doc.title === "string" ? doc.title : "";
  const description = typeof doc.description === "string" ? doc.description : null;
  const expiresAtUtc = getExpiryDate(doc as Record<string, unknown>);
  const expiresAtLocal = typeof doc.expiresAtLocal === "string" ? doc.expiresAtLocal : "";
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const isActive = typeof doc.isActive === "boolean" ? doc.isActive : true;

  if (!isActive || isExpired(expiresAtUtc)) {
    return { state: "missing" };
  }

  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(id))?.value ?? "";

  if (!cookieValue || cookieValue !== accessToken) {
    return {
      state: "locked",
      id,
      title,
      slug,
      description,
      expiresAtLocal,
    };
  }

  const mediaIds = normalizeStringArray(doc.mediaIds);
  const objectIds = mediaIds.filter((x) => ObjectId.isValid(x)).map((x) => new ObjectId(x));

  const mediaDocs =
    objectIds.length > 0
      ? await db.collection("media").find({ _id: { $in: objectIds } }).toArray()
      : [];

  const orderMap = new Map(mediaIds.map((value, index) => [value, index]));
  const mediaItems = mediaDocs
    .sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0))
    .map((doc) => toMediaItem(doc as Record<string, unknown>));

  return {
    state: "open",
    gallery: {
      id,
      title,
      slug,
      description,
      expiresAtLocal,
      mediaItems,
      downloadToken: accessToken,
    },
  };
}