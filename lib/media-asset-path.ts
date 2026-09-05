export const MEDIA_ASSET_ROUTE_PREFIX = "/api/media/asset/";

export function mediaAssetPath(mediaId: string, gallerySlug?: string | null) {
  const base = `${MEDIA_ASSET_ROUTE_PREFIX}${encodeURIComponent(mediaId)}`;
  if (!gallerySlug) return base;
  return `${base}?g=${encodeURIComponent(gallerySlug)}`;
}

export function isMediaAssetPath(src: string) {
  return src.startsWith(MEDIA_ASSET_ROUTE_PREFIX);
}
