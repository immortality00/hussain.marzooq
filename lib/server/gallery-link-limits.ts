import { consumeFixedWindowRateLimit, fixedWindowCount } from "@/lib/server/request-guards";

// A public gallery has no password, so a forwarded or leaked link must not be able to run up
// Netlify (each view is a function call) or Cloudinary (each download is bandwidth).
// Sized from measured files (U6): an opened photo ~420 KB, an original ~5.5 MB.
export const LINK_VIEWS_PER_ITEM_PER_DAY = 20;
export const LINK_MIN_VIEWS_PER_DAY = 200;
export const LINK_DOWNLOADS_PER_ITEM = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
// Downloads count over the link's life; galleries expire long before this.
const LINK_LIFETIME_MS = 365 * DAY_MS;

const VIEW_BUCKET = "gallery-link-view";
const DOWNLOAD_BUCKET = "gallery-link-download";

export const LINK_VIEWS_USED_UP_TEXT = "This link has been opened too many times today. Try again tomorrow.";
export const LINK_DOWNLOADS_USED_UP_TEXT = "This link has reached its download limit.";

type LinkGallery = { linkLimitKey: string | null; mediaIds: string[] };

export function linkViewLimit(itemCount: number) {
  return Math.max(LINK_MIN_VIEWS_PER_DAY, LINK_VIEWS_PER_ITEM_PER_DAY * itemCount);
}

export function linkDownloadLimit(itemCount: number) {
  return LINK_DOWNLOADS_PER_ITEM * Math.max(1, itemCount);
}

export async function consumeLinkView(gallery: LinkGallery) {
  if (!gallery.linkLimitKey) return { limited: false };
  return consumeFixedWindowRateLimit({
    bucket: VIEW_BUCKET,
    key: gallery.linkLimitKey,
    limit: linkViewLimit(gallery.mediaIds.length),
    windowMs: DAY_MS,
  });
}

// A ZIP counts every file in it.
export async function consumeLinkDownloads(gallery: LinkGallery, files: number) {
  if (!gallery.linkLimitKey) return { limited: false };
  return consumeFixedWindowRateLimit({
    bucket: DOWNLOAD_BUCKET,
    key: gallery.linkLimitKey,
    limit: linkDownloadLimit(gallery.mediaIds.length),
    windowMs: LINK_LIFETIME_MS,
    amount: files,
  });
}

export async function linkViewsUsedUp(gallery: LinkGallery) {
  if (!gallery.linkLimitKey) return false;
  const used = await fixedWindowCount({ bucket: VIEW_BUCKET, key: gallery.linkLimitKey });
  return used >= linkViewLimit(gallery.mediaIds.length);
}
