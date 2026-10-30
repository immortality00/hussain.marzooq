import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";

// The photography viewers draw photos in WebGL or after hydration, so the page HTML holds
// none; an image sitemap is how Google finds them. Each photo is listed at a width already
// on Cloudinary's strict allow list, never the multi-megabyte original.
export const SITEMAP_IMAGE_WIDTH = 1920;
export const MAX_SITEMAP_IMAGES = 1000;

export type SitemapPhoto = { url: string; tags: string[] };

// Next writes <image:loc> without escaping, so a character XML reads as markup is dropped,
// not listed — one bad address would make Google reject the whole sitemap.
const XML_SPECIAL = /[&<>"']/;

export function sitemapImageUrl(src: string): string | null {
  const url = cloudinaryImageLoader({ src, width: SITEMAP_IMAGE_WIDTH });
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return null;
    if (!parsed.pathname.includes("/upload/")) return null;
  } catch {
    return null;
  }
  return XML_SPECIAL.test(url) ? null : url;
}

export function sitemapImages(photos: SitemapPhoto[], tagSlug?: string): string[] {
  const urls = new Set<string>();
  for (const photo of photos) {
    if (tagSlug && !photo.tags.includes(tagSlug)) continue;
    const url = sitemapImageUrl(photo.url);
    if (url) urls.add(url);
    if (urls.size === MAX_SITEMAP_IMAGES) break;
  }
  return [...urls];
}
