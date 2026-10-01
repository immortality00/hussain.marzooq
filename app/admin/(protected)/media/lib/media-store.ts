import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type MediaSlice = AdminSnapshot["media"];

export type SavedMedia = { item: MediaSlice["full"][string]; listItem: MediaSlice["items"][number] };

export function withSavedMedia(media: MediaSlice, saved: SavedMedia, created: boolean): MediaSlice {
  const id = saved.listItem.id;
  const listed = media.items.some((entry) => entry.id === id);
  if (!created && !listed) return { ...media, full: { ...media.full, [id]: saved.item } };
  return {
    ...media,
    items: listed
      ? media.items.map((entry) => (entry.id === id ? saved.listItem : entry))
      : [saved.listItem, ...media.items],
    full: { ...media.full, [id]: saved.item },
  };
}

export function withoutMedia(media: MediaSlice, ids: string[]): MediaSlice {
  return { ...media, items: media.items.filter((entry) => !ids.includes(entry.id)) };
}
