import { ObjectId, type Db } from "mongodb";
import { asStringArray } from "@/app/api/_lib/common";
import { makeGallerySlug, normalizeLocalDateTimeString } from "@/lib/private-galleries";

export type PrivateGalleryAdminItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mediaIds: string[];
  isActive: boolean;
  expiresAtLocal: string;
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
    mediaIds: asStringArray(doc.mediaIds, 300),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    expiresAtLocal:
      typeof doc.expiresAtLocal === "string"
        ? normalizeLocalDateTimeString(doc.expiresAtLocal)
        : "",
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

export async function findPrivateGalleriesUsingMedia(db: Db, mediaId: string) {
  return db
    .collection("private_galleries")
    .find({ mediaIds: mediaId })
    .project({ _id: 1, title: 1, slug: 1 })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();
}

export function formatPrivateGalleryMediaDeleteBlocker(galleries: Record<string, unknown>[]) {
  const names = galleries
    .map((gallery) => {
      const title = typeof gallery.title === "string" ? gallery.title.trim() : "";
      const slug = typeof gallery.slug === "string" ? gallery.slug.trim() : "";
      return title || (slug ? `/g/${slug}` : "Untitled private gallery");
    })
    .filter(Boolean)
    .slice(0, 5);

  const suffix = galleries.length > names.length ? ` and ${galleries.length - names.length} more` : "";

  return `This media is used in private galleries: ${names.join(", ")}${suffix}. Remove it from those galleries before deleting it.`;
}