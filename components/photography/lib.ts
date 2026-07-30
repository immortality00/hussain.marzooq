import type { MediaItem } from "@/components/media/types";

export const CYLINDER_MAX_TEXTURES = 30;

/**
 * Inject lightweight delivery transforms into a Cloudinary /upload/ URL so
 * WebGL textures download small. Non-Cloudinary URLs are returned untouched.
 */
export function cloudinaryTextureUrl(url: string, width = 600): string {
  if (!url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*[whqf]_/.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

/** Image items with a usable source, capped for GPU/memory. Unique — no repeats. */
export function cylinderItems(items: MediaItem[]): MediaItem[] {
  return items.filter((m) => Boolean(m.secureUrl)).slice(0, CYLINDER_MAX_TEXTURES);
}
