import type { GalleryItem } from "./types";

export const MIN_PRIVATE_GALLERY_PASSWORD_LENGTH = 8;

export function parseLocalDateTime(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isExpiredLocalDateTime(value: string) {
  const parsed = parseLocalDateTime(value);
  return parsed ? parsed.getTime() <= Date.now() : false;
}

export function getGalleryExpiry(item: GalleryItem) {
  return item.expiresAtUtc
    ? parseLocalDateTime(item.expiresAtUtc)
    : parseLocalDateTime(item.expiresAtLocal);
}

export function isGalleryExpired(item: GalleryItem) {
  const expiry = getGalleryExpiry(item);
  return expiry ? expiry.getTime() <= Date.now() : false;
}

export function getGalleryStatus(item: GalleryItem) {
  const isExpired = isGalleryExpired(item);

  if (isExpired) {
    return {
      label: "Expired",
      className: "border-red-500/30 bg-red-500/10 text-red-200",
    };
  }

  if (!item.isActive) {
    return {
      label: "Inactive",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    };
  }

  return {
    label: "Active",
    className: "border-green-500/30 bg-green-500/10 text-green-200",
  };
}

export function galleryPath(slug: string, linkKey?: string | null) {
  return linkKey ? `/g/${slug}/${linkKey}` : `/g/${slug}`;
}

export function buildGalleryUrl(slug: string, linkKey?: string | null) {
  const path = galleryPath(slug, linkKey);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
// Adds the new ids after the current ones, keeping order and dropping repeats, until `max`.
export function addUpTo(current: string[], ids: string[], max: number) {
  const seen = new Set(current);
  const next = [...current];
  for (const id of ids) {
    if (next.length >= max) break;
    if (seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }
  return { ids: next, count: next.length - current.length };
}
