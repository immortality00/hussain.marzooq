"use client";

import { useCallback, useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminSlice } from "@/hooks/useAdminData";
import { filtersKey, isDefaultView, type MediaFilters } from "../../lib/media-pages";
import { withSavedMedia, withoutMedia, type SavedMedia } from "../../lib/media-store";
import { useMediaBrowse } from "../../lib/useMediaBrowse";
import { useRefreshingPages } from "../../lib/useRefreshingPages";

export type { MediaFilters };

// The search is already 500 ms behind the box (useDebouncedText), so a new search or filter loads at once.
const LOAD_AFTER_MS = 0;

export function useMediaListView(filters: MediaFilters, setBanner: (next: AdminActionFeedbackState) => void) {
  const [, setMedia] = useAdminSlice("media");
  const [loadingMore, setLoadingMore] = useState(false);
  const onError = useCallback((text: string) => setBanner({ type: "err", text }), [setBanner]);
  const defaultView = isDefaultView(filters);

  const browse = useMediaBrowse(onError);
  const search = useRefreshingPages(
    defaultView
      ? null
      : { key: filtersKey(filters), filters, startCursor: null, autoLoadAfterMs: LOAD_AFTER_MS, keep: true },
    onError
  );
  const view = defaultView ? browse : search;

  async function loadMore() {
    if (!view.nextCursor) return;
    setLoadingMore(true);
    try {
      await view.loadMore();
    } finally {
      setLoadingMore(false);
    }
  }

  function refresh() {
    setBanner(null);
    return view.refresh();
  }

  function removeItems(ids: string[]) {
    setMedia((media) => withoutMedia(media, ids));
    browse.remove(ids);
    search.remove(ids);
  }

  function replaceItem(saved: SavedMedia) {
    setMedia((media) => withSavedMedia(media, saved, false));
    browse.replace(saved);
    search.replace(saved);
  }

  return {
    items: view.items,
    nextCursor: view.nextCursor,
    loading: view.loading,
    loadingMore,
    loadMore,
    refresh,
    removeItems,
    replaceItem,
  };
}
