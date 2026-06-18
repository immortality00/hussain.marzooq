import type { MediaItem } from "./types";

export const MEDIA_PAGE_LIMIT = 60;
export const SELECTED_MEDIA_FETCH_LIMIT = 300;

export type MediaListResponse = {
  ok?: boolean;
  items?: MediaItem[];
  nextCursor?: string | null;
  error?: string;
};

export function buildMediaQuery(params: { q?: string; cursor?: string | null; ids?: string[] }) {
  const searchParams = new URLSearchParams();

  if (params.ids?.length) {
    searchParams.set("ids", params.ids.join(","));
    searchParams.set("limit", String(SELECTED_MEDIA_FETCH_LIMIT));
    return `/api/media/admin-list?${searchParams.toString()}`;
  }

  searchParams.set("limit", String(MEDIA_PAGE_LIMIT));

  const q = params.q?.trim();
  if (q) searchParams.set("q", q);
  if (params.cursor) searchParams.set("cursor", params.cursor);

  return `/api/media/admin-list?${searchParams.toString()}`;
}

export function mergeMediaItems(current: MediaItem[], next: MediaItem[]) {
  const map = new Map<string, MediaItem>();

  for (const item of current) map.set(item.id, item);
  for (const item of next) map.set(item.id, item);

  return Array.from(map.values());
}

export function mediaMetaText(item: MediaItem) {
  return [item.location, item.event, item.tags.join(", "), item.people.join(", ")]
    .filter(Boolean)
    .join(" • ");
}