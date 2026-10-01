import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { ADMIN_MEDIA_MAX, ADMIN_MEDIA_PAGE } from "@/lib/admin-data";
import { appendAdminMedia, getAdminData } from "@/lib/client/admin-store";

export type MediaListItem = AdminSnapshot["media"]["items"][number];
export type MediaFilters = { query: string; category: string; type: string; visibility: string };
export type MediaPage = { items: MediaListItem[]; nextCursor: string | null; full?: AdminSnapshot["media"]["full"] };

export const NO_FILTERS: MediaFilters = { query: "", category: "", type: "", visibility: "" };

export const isDefaultView = (f: MediaFilters) =>
  !f.query.trim() && !f.category.trim() && !f.type.trim() && !f.visibility.trim();

export const filtersKey = (f: MediaFilters) =>
  JSON.stringify([f.query.trim(), f.category.trim(), f.type.trim(), f.visibility.trim()]);

export const refetchLimit = (loaded: number) => Math.min(Math.max(loaded, ADMIN_MEDIA_PAGE), ADMIN_MEDIA_MAX);

export function mediaListUrl(filters: MediaFilters, cursor: string | null, limit = ADMIN_MEDIA_PAGE, full = false) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category.trim()) params.set("category", filters.category.trim());
  if (filters.type.trim()) params.set("type", filters.type.trim());
  if (filters.visibility.trim()) params.set("visibility", filters.visibility.trim());
  if (cursor) params.set("cursor", cursor);
  if (full) params.set("full", "1");
  return `/api/media/admin-list?${params.toString()}`;
}

export async function fetchMediaPage(url: string): Promise<MediaPage> {
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as (MediaPage & { ok?: boolean; error?: string }) | null;
  if (!res.ok || !data?.ok || !Array.isArray(data.items)) throw new Error(data?.error ?? "Failed to load media.");
  return { items: data.items, nextCursor: data.nextCursor ?? null, full: data.full };
}

export const sharedMediaIsFull = (media: AdminSnapshot["media"]) => media.items.length >= ADMIN_MEDIA_MAX;

export async function loadMoreSharedMedia() {
  const media = getAdminData()?.media;
  if (!media?.nextCursor || sharedMediaIsFull(media)) return;
  const page = await fetchMediaPage(mediaListUrl(NO_FILTERS, media.nextCursor, ADMIN_MEDIA_PAGE, true));
  appendAdminMedia({ items: page.items, nextCursor: page.nextCursor, full: page.full ?? {} });
}

export function appendUnique<T extends { id: string }>(previous: T[], next: T[]) {
  const seen = new Set(previous.map((item) => item.id));
  return [...previous, ...next.filter((item) => !seen.has(item.id))];
}
