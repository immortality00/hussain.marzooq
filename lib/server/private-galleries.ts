import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { sanitizeAppearances } from "@/app/api/_lib/media";
import type { MediaItem } from "@/components/media/types";
import {
  getPrivateGalleryExpiryDate,
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";
import { getDb } from "@/lib/server/db";

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

export async function getPrivateGalleryAdminList(): Promise<PrivateGallerySummary[]> {
  const db = await getDb();

  const docs = await db
    .collection("private_galleries")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

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
  const db = await getDb();
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

export async function getPrivateGalleryPublicBySlug(
  slug: string
): Promise<
  | { state: "missing" }
  | {
      state: "locked";
      id: string;
      title: string;
      slug: string;
      description: string | null;
      expiresAtLocal: string;
    }
  | { state: "open"; gallery: PrivateGalleryPublic }
> {
  const db = await getDb();

  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc) return { state: "missing" };

  const id = String(doc._id);
  const title = typeof doc.title === "string" ? doc.title : "";
  const description = typeof doc.description === "string" ? doc.description : null;
  const expiresAtUtc = getPrivateGalleryExpiryDate(doc as Record<string, unknown>);
  const expiresAtLocal = typeof doc.expiresAtLocal === "string" ? doc.expiresAtLocal : "";
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";

  if (isPrivateGalleryUnavailable(doc as Record<string, unknown>)) {
    return { state: "missing" };
  }

  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(id))?.value ?? "";
  const hasAccess = verifyPrivateGalleryCookieValue({ galleryId: id, accessToken, cookieValue });

  if (!hasAccess) {
    return {
      state: "locked",
      id,
      title,
      slug,
      description,
      expiresAtLocal,
    };
  }

  if (expiresAtUtc && expiresAtUtc.getTime() <= Date.now()) {
    return { state: "missing" };
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
    },
  };
}