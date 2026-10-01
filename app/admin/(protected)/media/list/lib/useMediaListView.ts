"use client";

import { useCallback, useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminSlice } from "@/hooks/useAdminData";
import { filtersKey, isDefaultView, type MediaFilters } from "../../lib/media-pages";
import { withoutMedia } from "../../lib/media-store";
import { useMediaBrowse } from "../../lib/useMediaBrowse";
import { useRefreshingPages } from "../../lib/useRefreshingPages";

export type { MediaFilters };

const SEARCH_DEBOUNCE_MS = 250;

export function useMediaListView(filters: MediaFilters, setBanner: (next: AdminActionFeedbackState) => void) {
  const [, setMedia] = useAdminSlice("media");
  const [loadingMore, setLoadingMore] = useState(false);
  const onError = useCallback((text: string) => setBanner({ type: "err", text }), [setBanner]);
  const defaultView = isDefaultView(filters);

  const browse = useMediaBrowse(onError);
  const search = useRefreshingPages(
    defaultView ? null : { key: filtersKey(filters), filters, startCursor: null, autoLoadAfterMs: SEARCH_DEBOUNCE_MS },
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

  return {
    items: view.items,
    nextCursor: view.nextCursor,
    loading: view.loading,
    loadingMore,
    loadMore,
    refresh,
    removeItems,
  };
}
