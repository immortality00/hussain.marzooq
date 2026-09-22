/**
 * Cloudinary caps a single transformation at 25 megapixels of OUTPUT and answers
 * anything larger with `400 Maximum image size is 25 Megapixels`. `c_limit` with a
 * width alone scales a tall original past that cap — a 4848x8619 photo at w_3840
 * becomes 26.2 MP — so the largest srcset candidate 400s while every smaller one
 * succeeds. Pairing the width with a height bound keeps the fitted box under the
 * cap; it never changes a request that was already inside it.
 */

export const MAX_TRANSFORM_PIXELS = 24_500_000;

export function heightCapForWidth(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 0;
  return Math.floor(MAX_TRANSFORM_PIXELS / Math.round(width));
}

/**
 * Cloudinary's Free plan rejects any single image upload over 10MB outright — a
 * separate, lower ceiling than the 25MP transform cap above, enforced on the final
 * assembled file regardless of whether it arrived in one request or several chunks.
 * 10,485,760 is 10 MiB, the plan's actual byte-for-byte cutoff (a "10MB" file shown
 * in decimal MB can be a few hundred KB over this and still get rejected). Raise this
 * only after actually upgrading the Cloudinary plan tier.
 */
export const MAX_UPLOAD_BYTES = 10_485_760;
