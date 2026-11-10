import { after } from "next/server";
import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import { IMAGE_DEVICE_SIZES, TEXTURE_WIDTH, TEXTURE_WIDTH_SMALL } from "@/lib/image-sizes";
import { cloudinaryTextureUrl } from "@/components/photography/lib";
import { settleLimited } from "@/lib/settle-limited";

/**
 * Cloudinary makes each size of a photo the first time anyone asks for it, which
 * costs that visitor about 1.7 s (measured 2026-11-10: "miss", cloudinary;dur≈1600).
 * Asking once in advance — a HEAD request, so nothing is downloaded — makes the
 * size ready for everyone after ("hit", first byte ≈ 0.55 s from Dubai).
 *
 * Every width next/image can pick for a photo is warmed. Cloudinary chooses the
 * format from the browser, so the request carries a Chrome and a Safari identity;
 * when both get the same format the second is an instant hit and costs nothing.
 */
export const WARM_WIDTHS = IMAGE_DEVICE_SIZES;

const ACCEPT_CHROME = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
const ACCEPT_SAFARI = "image/webp,image/avif,image/jxl,image/heic,image/heic-sequence,video/*;q=0.8,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5";
const BROWSERS = [
  {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    accept: ACCEPT_CHROME,
  },
  {
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
    accept: ACCEPT_SAFARI,
  },
];

const PARALLEL = 8;
const TIMEOUT_MS = 20_000;

type WarmDoc = Readonly<Record<string, unknown>>;

/**
 * The picture a popup shows large: a public photo delivered straight from Cloudinary,
 * or a video link's stored poster. Private files have no public sizes.
 */
export function warmableUrl(doc: WarmDoc): string | null {
  if (doc.isPublic === false) return null;
  const url =
    doc.type === "image" && doc.deliveryType !== "authenticated"
      ? doc.secureUrl
      : doc.type === "embed"
        ? doc.posterUrl
        : null;
  if (typeof url !== "string") return null;
  return cloudinaryImageLoader({ src: url, width: WARM_WIDTHS[0] }) === url ? null : url;
}

/**
 * The delivery addresses of every width, exactly as the site's loader builds them;
 * photos also get the Cylinder's two texture sizes (posters never appear there).
 */
export function warmUrls(secureUrl: string, withTextures = false): string[] {
  const sizes = WARM_WIDTHS.map((width) => cloudinaryImageLoader({ src: secureUrl, width }));
  const textures = withTextures ? [TEXTURE_WIDTH, TEXTURE_WIDTH_SMALL].map((w) => cloudinaryTextureUrl(secureUrl, w)) : [];
  return [...new Set([...sizes, ...textures])];
}

export type WarmResult = { requested: number; failed: string[] };

export async function warmImageSizes(
  secureUrl: string,
  fetchImpl: typeof fetch = fetch,
  withTextures = false,
): Promise<WarmResult> {
  const urls = warmUrls(secureUrl, withTextures);
  const failed: string[] = [];
  for (const headers of BROWSERS) {
    const results = await settleLimited(urls, PARALLEL, async (url) => {
      const res = await fetchImpl(url, { method: "HEAD", headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
    });
    results.forEach((r, i) => {
      if (r.status === "rejected") failed.push(r.reason instanceof Error ? r.reason.message : urls[i]);
    });
  }
  return { requested: urls.length * BROWSERS.length, failed: [...new Set(failed)] };
}

/** After a save: warm the photo's sizes once the reply has gone, never failing the save. */
export function queueImageWarm(doc: WarmDoc | null | undefined) {
  const url = doc ? warmableUrl(doc) : null;
  // Unit tests save media through these routes; they must never reach Cloudinary.
  if (!url || process.env.NODE_ENV === "test") return;
  const run = async () => {
    try {
      const { failed } = await warmImageSizes(url, fetch, doc?.type === "image");
      if (failed.length) console.error(`[cloudinary-warm] ${failed.length} sizes not ready: ${failed[0]}`);
    } catch (error) {
      console.error("[cloudinary-warm] failed", error);
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}
