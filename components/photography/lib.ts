import type { MediaItem } from "@/components/media/types";

/** Texture budget. Phones get fewer, smaller textures — same scene, less GPU/bandwidth. */
export const CYLINDER_MAX_TEXTURES = 30;
export const CYLINDER_MAX_TEXTURES_SMALL = 16;
const TEXTURE_WIDTH = 600;
const TEXTURE_WIDTH_SMALL = 420;
const SMALL_SCREEN_PX = 768;

function isSmallScreen(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < SMALL_SCREEN_PX;
}

export function textureWidth(): number {
  return isSmallScreen() ? TEXTURE_WIDTH_SMALL : TEXTURE_WIDTH;
}

export function maxTextures(): number {
  return isSmallScreen() ? CYLINDER_MAX_TEXTURES_SMALL : CYLINDER_MAX_TEXTURES;
}

/**
 * Inject lightweight delivery transforms into a Cloudinary /upload/ URL so
 * WebGL textures download small. Non-Cloudinary URLs are returned untouched.
 */
export function cloudinaryTextureUrl(url: string, width = textureWidth()): string {
  if (!url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*[whqf]_/.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

/** Image items with a usable source, capped for GPU/memory. Unique — no repeats. */
export function cylinderItems(items: MediaItem[]): MediaItem[] {
  return items.filter((m) => Boolean(m.secureUrl)).slice(0, maxTextures());
}
