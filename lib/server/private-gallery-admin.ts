import { ObjectId, type Db } from "mongodb";
import { asStringArray } from "@/app/api/_lib/common";
import {
  PRIVATE_GALLERY_FILTER,
  galleryVisibilityOf,
  getPrivateGalleryExpiryDate,
  isGalleryLinkKey,
  makeGallerySlug,
  normalizeLocalDateTimeString,
  type GalleryVisibility,
} from "@/lib/private-galleries";
import { GALLERY_MAX_ITEMS } from "@/lib/admin-data";

export type PrivateGalleryAdminItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: GalleryVisibility;
  // The admin copies the link from here; it lives in memory on the admin's devices only.
  linkKey: string | null;
  mediaIds: string[];
  isActive: boolean;
  expiresAtLocal: string;
  expiresAtUtc: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export function serializePrivateGalleryAdminItem(
  doc: Record<string, unknown>
): PrivateGalleryAdminItem {
  return {
    id: String(doc._id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    description: typeof doc.description === "string" ? doc.description : null,
    visibility: galleryVisibilityOf(doc),
    linkKey: galleryVisibilityOf(doc) === "public" && isGalleryLinkKey(doc.linkKey) ? doc.linkKey : null,
    mediaIds: asStringArray(doc.mediaIds, GALLERY_MAX_ITEMS),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    expiresAtLocal:
      typeof doc.expiresAtLocal === "string"
        ? normalizeLocalDateTimeString(doc.expiresAtLocal)
        : "",
    expiresAtUtc: getPrivateGalleryExpiryDate(doc)?.toISOString() ?? null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  };
}

export async function ensureUniquePrivateGallerySlug(
  db: Db,
  input: { title: string; slugInput: string; excludeId?: string }
) {
  const baseSlug = makeGallerySlug(input.slugInput || input.title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const found = await db.collection("private_galleries").findOne({ slug });
    if (!found) return slug;
    if (input.excludeId && String(found._id) === input.excludeId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

export function normalizePrivateGalleryMediaIds(rawMediaIds: string[]) {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const id of rawMediaIds) {
    const normalized = id.trim();
    if (!normalized) continue;
    if (!ObjectId.isValid(normalized)) return { ok: false as const, error: "Invalid media selection." };
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    ids.push(normalized);
  }

  if (ids.length === 0) {
    return { ok: false as const, error: "Select at least one media item." };
  }

  return { ok: true as const, mediaIds: ids };
}

export async function validatePrivateGalleryMediaIds(db: Db, rawMediaIds: string[]) {
  const normalized = normalizePrivateGalleryMediaIds(rawMediaIds);
  if (!normalized.ok) return normalized;

  const objectIds = normalized.mediaIds.map((id) => new ObjectId(id));
  const existing = await db
    .collection("media")
    .find({ _id: { $in: objectIds } }, { projection: { _id: 1 } })
    .toArray();

  if (existing.length !== normalized.mediaIds.length) {
    return {
      ok: false as const,
      error: "One or more selected media items no longer exist. Refresh the picker and save again.",
    };
  }

  return normalized;
}

// Every gallery holding the item, public ones included (a media delete is blocked by both).
export async function findPrivateGalleriesUsingMedia(db: Db, mediaId: string, onlyPrivate = false) {
  return db
    .collection("private_galleries")
    .find(onlyPrivate ? { mediaIds: mediaId, ...PRIVATE_GALLERY_FILTER } : { mediaIds: mediaId })
    .project({ _id: 1, title: 1, slug: 1 })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();
}

function galleryTitle(gallery: Record<string, unknown>) {
  const title = typeof gallery.title === "string" ? gallery.title.trim() : "";
  const slug = typeof gallery.slug === "string" ? gallery.slug.trim() : "";
  return title || (slug ? `/g/${slug}` : "Untitled gallery");
}

// Only private galleries keep an item hidden; a public gallery leaves it as it is.
export async function getPrivateGalleryTitlesForMedia(db: Db, mediaId: string) {
  const galleries = await findPrivateGalleriesUsingMedia(db, mediaId, true);
  return galleries.map(galleryTitle);
}

export async function getPrivateGalleryTitlesByMedia(db: Db, mediaIds: string[]) {
  const titles = new Map<string, string[]>();
  if (mediaIds.length === 0) return titles;

  const galleries = await db
    .collection("private_galleries")
    .find({ mediaIds: { $in: mediaIds }, ...PRIVATE_GALLERY_FILTER })
    .project({ _id: 1, title: 1, slug: 1, mediaIds: 1 })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const wanted = new Set(mediaIds);
  for (const gallery of galleries) {
    const ids: unknown[] = Array.isArray(gallery.mediaIds) ? gallery.mediaIds : [];
    for (const id of ids) {
      if (typeof id !== "string" || !wanted.has(id)) continue;
      titles.set(id, [...(titles.get(id) ?? []), galleryTitle(gallery)]);
    }
  }
  return titles;
}

export function formatPrivateGalleryMediaDeleteBlocker(galleries: Record<string, unknown>[]) {
  const names = galleries
    .map((gallery) => {
      const title = typeof gallery.title === "string" ? gallery.title.trim() : "";
      const slug = typeof gallery.slug === "string" ? gallery.slug.trim() : "";
      return title || (slug ? `/g/${slug}` : "Untitled gallery");
    })
    .filter(Boolean)
    .slice(0, 5);

  const suffix = galleries.length > names.length ? ` and ${galleries.length - names.length} more` : "";

  return `This media is used in galleries: ${names.join(", ")}${suffix}. Remove it from those galleries before deleting it.`;
}