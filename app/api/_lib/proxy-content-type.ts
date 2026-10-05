const IMAGE_TYPE = /^image\/(jpe?g|png|webp|gif|avif)\s*(;|$)/i;
const VIDEO_TYPE = /^video\/[a-z0-9.+-]+\s*(;|$)/i;

export function isProxiedImageType(contentType: string | null): contentType is string {
  return IMAGE_TYPE.test(contentType ?? "");
}

export function isProxiedMediaType(contentType: string | null): contentType is string {
  return isProxiedImageType(contentType) || VIDEO_TYPE.test(contentType ?? "");
}
