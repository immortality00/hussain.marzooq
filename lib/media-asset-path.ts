export const MEDIA_ASSET_ROUTE_PREFIX = "/api/media/asset/";

// A public gallery's hidden files carry its key (`k`): the link is the only key it has.
export function mediaAssetPath(mediaId: string, gallerySlug?: string | null, linkKey?: string | null) {
  const base = `${MEDIA_ASSET_ROUTE_PREFIX}${encodeURIComponent(mediaId)}`;
  if (!gallerySlug) return base;
  const gallery = `${base}?g=${encodeURIComponent(gallerySlug)}`;
  return linkKey ? `${gallery}&k=${encodeURIComponent(linkKey)}` : gallery;
}

// An unlocked password-protected profile reads its private files through this address;
// the route checks that person's cookie (lib/server/person-gate-media.ts).
export function personMediaAssetPath(mediaId: string, personSlug: string) {
  return `${MEDIA_ASSET_ROUTE_PREFIX}${encodeURIComponent(mediaId)}?p=${encodeURIComponent(personSlug)}`;
}

export function isMediaAssetPath(src: string) {
  return src.startsWith(MEDIA_ASSET_ROUTE_PREFIX);
}
