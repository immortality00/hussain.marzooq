export const MEDIA_ASSET_ROUTE_PREFIX = "/api/media/asset/";

export function mediaAssetPath(mediaId: string, gallerySlug?: string | null) {
  const base = `${MEDIA_ASSET_ROUTE_PREFIX}${encodeURIComponent(mediaId)}`;
  if (!gallerySlug) return base;
  return `${base}?g=${encodeURIComponent(gallerySlug)}`;
}

// An unlocked password-protected profile reads its private files through this address;
// the route checks that person's cookie (lib/server/person-gate-media.ts).
export function personMediaAssetPath(mediaId: string, personSlug: string) {
  return `${MEDIA_ASSET_ROUTE_PREFIX}${encodeURIComponent(mediaId)}?p=${encodeURIComponent(personSlug)}`;
}

export function isMediaAssetPath(src: string) {
  return src.startsWith(MEDIA_ASSET_ROUTE_PREFIX);
}
