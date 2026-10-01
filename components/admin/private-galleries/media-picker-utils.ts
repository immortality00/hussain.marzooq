import { ADMIN_MEDIA_MAX } from "@/lib/admin-data";
import type { MediaItem } from "./types";

export function mediaIdsQuery(ids: string[]) {
  const params = new URLSearchParams({ ids: ids.join(","), limit: String(ADMIN_MEDIA_MAX) });
  return `/api/media/admin-list?${params.toString()}`;
}

export function mergeMediaItems<T extends { id: string }>(current: T[], next: T[]) {
  const map = new Map<string, T>();

  for (const item of current) map.set(item.id, item);
  for (const item of next) map.set(item.id, item);

  return Array.from(map.values());
}

export function mediaMetaText(item: MediaItem) {
  return [item.location, item.event, item.tags.join(", "), item.people.join(", ")]
    .filter(Boolean)
    .join(" • ");
}
