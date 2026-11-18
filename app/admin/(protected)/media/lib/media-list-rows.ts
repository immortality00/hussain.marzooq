import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { ADMIN_MEDIA_PAGE } from "@/lib/admin-data";
import { getAdminData, getAdminDataGeneration } from "@/lib/client/admin-store";
import {
  appendUnique,
  fetchMediaPage,
  filtersKey,
  isDefaultView,
  loadMoreSharedMedia,
  mediaListUrl,
  sharedMediaIsFull,
  TAIL_KEY,
  type MediaFilters,
  type MediaListItem,
} from "./media-pages";
import { getPageSet, setPageSet, type PageSet } from "./media-page-sets";

type Rows = { items: MediaListItem[]; nextCursor: string | null };

// The rows a media list view shows, read outside the list (the editor's Previous / Next item): the default
// view is the shared admin data's items (up to 300) followed by the kept tail; a search or filter is its kept
// pages. `keptKeyOf` names the kept set the view uses.
export function keptKeyOf(filters: MediaFilters): string {
  return isDefaultView(filters) ? TAIL_KEY : filtersKey(filters);
}

export function rowsOfView(filters: MediaFilters, media: AdminSnapshot["media"], kept: PageSet | undefined): Rows {
  if (!isDefaultView(filters)) return { items: kept?.items ?? [], nextCursor: kept?.nextCursor ?? null };
  if (!sharedMediaIsFull(media)) return { items: media.items, nextCursor: media.nextCursor };
  return {
    items: kept ? appendUnique(media.items, kept.items) : media.items,
    nextCursor: kept ? kept.nextCursor : media.nextCursor,
  };
}

// The next page of a view, loaded where the list's own Load more puts it, so the list has it too on return.
export async function loadNextRows(filters: MediaFilters): Promise<void> {
  const media = getAdminData()?.media;
  if (!media) return;
  const defaultView = isDefaultView(filters);
  if (defaultView && !sharedMediaIsFull(media)) return loadMoreSharedMedia();

  const key = keptKeyOf(filters);
  const kept = getPageSet(key);
  const cursor = kept ? kept.nextCursor : defaultView ? media.nextCursor : null;
  if (!cursor) return;

  const page = await fetchMediaPage(mediaListUrl(filters, cursor, ADMIN_MEDIA_PAGE, true));
  const generation = getAdminDataGeneration();
  setPageSet(key, (previous) => ({
    items: previous ? appendUnique(previous.items, page.items) : page.items,
    nextCursor: page.nextCursor,
    full: { ...(previous?.full ?? {}), ...(page.full ?? {}) },
    generation,
  }));
}

export type ItemNeighbours = { found: boolean; previous: string | null; next: string | null; loadsMore: boolean };

// An item's neighbours in a view's rows; at the last loaded row, Next loads the next page when there is one.
export function itemNeighbours(ids: readonly string[], id: string, hasMore: boolean): ItemNeighbours {
  const index = ids.indexOf(id);
  if (index < 0) return { found: false, previous: null, next: null, loadsMore: false };
  return {
    found: true,
    previous: index > 0 ? ids[index - 1] : null,
    next: index < ids.length - 1 ? ids[index + 1] : null,
    loadsMore: index === ids.length - 1 && hasMore,
  };
}
