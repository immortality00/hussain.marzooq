import { cookies } from "next/headers";
import { ObjectId, type Db, type Document } from "mongodb";
import { sanitizeAppearances } from "@/app/api/_lib/media";
import type { MediaItem } from "@/components/media/types";
import {
  galleryVisibilityOf,
  galleryLinkOpens,
  getPrivateGalleryExpiryDate,
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";
import { mediaAssetPath } from "@/lib/media-asset-path";
import { normalizeDeliveryType } from "@/lib/server/cloudinary-private";
import { getDb } from "@/lib/server/db";
import { openUnlockedGallery } from "@/app/api/private-galleries/_lib/gallery-access";
import { linkViewsUsedUp } from "@/lib/server/gallery-link-limits";

export type PrivateGalleryPublic = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  expiresAtLocal: string;
  linkKey: string | null;
  mediaItems: MediaItem[];
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

// A public gallery's photo that is itself public loads straight from Cloudinary, like on
// the rest of the site; a hidden one, and every photo of a private gallery, through the site.
function fileAddress(doc: Record<string, unknown>, gallerySlug: string, linkKey: string | null) {
  if (typeof doc.publicId !== "string" || !doc.publicId) return null;
  const publicFile =
    linkKey && normalizeDeliveryType(doc.deliveryType) === "upload" && typeof doc.secureUrl === "string";
  return publicFile ? (doc.secureUrl as string) : mediaAssetPath(String(doc._id), gallerySlug, linkKey);
}

function toMediaItem(doc: Record<string, unknown>, gallerySlug: string, linkKey: string | null): MediaItem {
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
    secureUrl: fileAddress(doc, gallerySlug, linkKey),
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    posterUrl: typeof doc.posterUrl === "string" ? doc.posterUrl : null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : null,
  };
}

async function hasGalleryCookie(doc: Document) {
  const id = String(doc._id);
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(id))?.value ?? "";
  return verifyPrivateGalleryCookieValue({ galleryId: id, accessToken, cookieValue });
}

async function openGallery(db: Db, doc: Document, linkKey: string | null): Promise<PrivateGalleryPublic> {
  const slug = String(doc.slug);
  const mediaIds = normalizeStringArray(doc.mediaIds);
  const objectIds = mediaIds.filter((x) => ObjectId.isValid(x)).map((x) => new ObjectId(x));

  const mediaDocs =
    objectIds.length > 0
      ? await db.collection("media").find({ _id: { $in: objectIds } }).toArray()
      : [];

  const orderMap = new Map(mediaIds.map((value, index) => [value, index]));
  const mediaItems = mediaDocs
    .sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0))
    .map((media) => toMediaItem(media as Record<string, unknown>, slug, linkKey));

  return {
    id: String(doc._id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug,
    description: typeof doc.description === "string" ? doc.description : null,
    expiresAtLocal: typeof doc.expiresAtLocal === "string" ? doc.expiresAtLocal : "",
    linkKey,
    mediaItems,
  };
}

// A public gallery never answers at /g/<slug>: it has no password to ask for.
async function findPasswordGallery(db: Db, slug: string) {
  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc || galleryVisibilityOf(doc) !== "private") return null;
  if (isPrivateGalleryUnavailable(doc as Record<string, unknown>)) return null;
  return doc;
}

export async function getPrivateGalleryMetaBySlug(slug: string) {
  const db = await getDb();
  const doc = await findPasswordGallery(db, slug);
  if (!doc) return { exists: false, unlocked: false, title: "" };

  const unlocked = await hasGalleryCookie(doc);
  return {
    exists: true,
    unlocked,
    title: unlocked && typeof doc.title === "string" ? doc.title : "",
  };
}

export async function getPrivateGalleryPublicBySlug(
  slug: string
): Promise<
  | { state: "missing" }
  | { state: "locked"; slug: string }
  | { state: "open"; gallery: PrivateGalleryPublic }
> {
  const db = await getDb();
  const doc = await findPasswordGallery(db, slug);
  if (!doc) return { state: "missing" };
  if (!(await hasGalleryCookie(doc))) return { state: "locked", slug };

  const expiresAtUtc = getPrivateGalleryExpiryDate(doc as Record<string, unknown>);
  if (expiresAtUtc && expiresAtUtc.getTime() <= Date.now()) return { state: "missing" };

  return { state: "open", gallery: await openGallery(db, doc, null) };
}

export async function getLinkGalleryTitle(slug: string, key: string) {
  const db = await getDb();
  const doc = await db
    .collection("private_galleries")
    .findOne({ slug }, { projection: { title: 1, visibility: 1, linkKey: 1, isActive: 1, expiresAtUtc: 1, expiresAt: 1 } });

  if (!doc || isPrivateGalleryUnavailable(doc as Record<string, unknown>) || !galleryLinkOpens(doc, key)) return null;
  return typeof doc.title === "string" ? doc.title : "";
}

export async function getLinkGalleryPublic(
  slug: string,
  key: string
): Promise<{ state: "missing" } | { state: "open"; gallery: PrivateGalleryPublic; viewsUsedUp: boolean }> {
  const unlocked = await openUnlockedGallery(slug, key);
  if (!unlocked.ok || !unlocked.gallery.linkLimitKey) return { state: "missing" };

  const db = await getDb();
  const doc = await db.collection("private_galleries").findOne({ slug });
  if (!doc) return { state: "missing" };

  const [gallery, viewsUsedUp] = await Promise.all([
    openGallery(db, doc, key),
    linkViewsUsedUp(unlocked.gallery),
  ]);
  return { state: "open", gallery, viewsUsedUp };
}
