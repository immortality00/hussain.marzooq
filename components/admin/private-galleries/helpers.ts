import type { GalleryItem } from "./types";

export const MIN_PRIVATE_GALLERY_PASSWORD_LENGTH = 8;

export function parseLocalDateTime(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getGalleryStatus(item: GalleryItem) {
  const expiry = parseLocalDateTime(item.expiresAtLocal);
  const isExpired = expiry ? expiry.getTime() <= Date.now() : false;

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

export function buildGalleryUrl(slug: string) {
  if (typeof window === "undefined") return `/g/${slug}`;
  return `${window.location.origin}/g/${slug}`;
}