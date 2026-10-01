export const ADMIN_SNAPSHOT_PATH = "/api/admin/snapshot";
export const ADMIN_ANALYTICS_PATH = "/api/admin/analytics";
export const KNOWN_VERSION_HEADER = "x-hm-data-version";
export const MEDIA_COUNT_HEADER = "x-hm-media-count";
export const ANALYTICS_DAYS = 30;
export const ADMIN_ACTIVE_INQUIRY_LIMIT = 1000;
export const ADMIN_ARCHIVED_INQUIRY_LIMIT = 100;
export const ADMIN_MEDIA_PAGE = 60;
export const ADMIN_MEDIA_MAX = 300;
export const ADMIN_BUILD = process.env.NEXT_PUBLIC_ADMIN_BUILD ?? "dev";

export function adminMediaCount(value: unknown) {
  const count = Math.floor(Number(value));
  if (!Number.isFinite(count)) return ADMIN_MEDIA_PAGE;
  return Math.min(Math.max(count, ADMIN_MEDIA_PAGE), ADMIN_MEDIA_MAX);
}

export type AttentionCounts = {
  testimonials: { pending: number };
  inquiries: { new: number };
  removalRequests: number;
};

export function pendingCount(counts: AttentionCounts) {
  return counts.testimonials.pending + counts.inquiries.new + counts.removalRequests;
}
