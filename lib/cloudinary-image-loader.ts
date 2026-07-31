/**
 * Custom next/image loader — sends resizing to Cloudinary instead of Next's optimizer.
 *
 * Why: `/_next/image` downloads the FULL original from Cloudinary (multi-MB), re-encodes
 * it with sharp, then serves it. On a slow connection that blows past Next's 7s fetch
 * timeout and the request 500s — which is exactly what was happening (500s at 7.4s/7.9s/8.3s,
 * `UND_ERR_SOCKET` after ~2.6MB read).
 *
 * Cloudinary is already a CDN with a transformation pipeline, so the browser can fetch a
 * correctly-sized, auto-format image directly. No origin round-trip, no re-encode, no timeout.
 *
 * Non-Cloudinary sources pass through untouched.
 */

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/upload/";

/** Already carries an explicit transform (w_/h_/q_/f_) — don't stack another one. */
function hasTransform(src: string): boolean {
  return /\/upload\/[^/]*(?:^|,)?[whqf]_/.test(src);
}

export default function cloudinaryImageLoader({ src, width, quality }: LoaderArgs): string {
  if (!src.includes(CLOUDINARY_HOST) || !src.includes(UPLOAD_SEGMENT)) return src;
  if (hasTransform(src)) return src;

  // c_limit never upscales past the original. q_auto/f_auto let Cloudinary pick
  // the best quality/format (AVIF/WebP) per browser.
  const transform = `w_${width},c_limit,q_${quality ?? "auto"},f_auto`;
  return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transform}/`);
}
