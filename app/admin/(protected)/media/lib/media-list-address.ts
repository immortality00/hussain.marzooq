import { withAddressValues } from "@/lib/address-values";
import type { MediaFilters } from "./media-pages";

// The media list's search and filters in its address (`?q=&category=&type=&visibility=`), the editor's item
// (`?edit=`), and the name the list's way back is kept under (lib/client/list-return.ts).
export const MEDIA_LIST_PATH = "/admin/media/list";
export const MEDIA_LIST_PARAMS = ["q", "category", "type", "visibility"] as const;
export const MEDIA_EDITOR_PARAMS = ["edit"] as const;
export const MEDIA_LIST = "media";

export type MediaListAddress = Record<(typeof MEDIA_LIST_PARAMS)[number], string>;

export function filtersFromAddress(address: MediaListAddress): MediaFilters {
  return { query: address.q, category: address.category, type: address.type, visibility: address.visibility };
}

export function mediaListHref(filters: MediaFilters): string {
  const query = withAddressValues("", {
    q: filters.query,
    category: filters.category,
    type: filters.type,
    visibility: filters.visibility,
  });
  return `${MEDIA_LIST_PATH}${query}`;
}

export function mediaEditHref(id: string): string {
  return `/admin/media?edit=${encodeURIComponent(id)}`;
}
