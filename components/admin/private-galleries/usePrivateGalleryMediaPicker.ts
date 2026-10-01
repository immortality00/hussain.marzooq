"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnAdminDataChange } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { NO_FILTERS, fetchMediaPage, type MediaListItem } from "@/app/admin/(protected)/media/lib/media-pages";
import { useMediaBrowse } from "@/app/admin/(protected)/media/lib/useMediaBrowse";
import { useRefreshingPages } from "@/app/admin/(protected)/media/lib/useRefreshingPages";
import { mediaIdsQuery, mergeMediaItems } from "./media-picker-utils";

const SEARCH_DEBOUNCE_MS = 250;

async function fetchPreviews(ids: string[]) {
  if (ids.length === 0) return [];
  try {
    return (await fetchMediaPage(mediaIdsQuery(ids))).items;
  } catch {
    return [];
  }
}

function useSelectedPreviews(selectedMediaIds: string[], shown: MediaListItem[]) {
  const [fetched, setFetched] = useState<MediaListItem[]>([]);
  const shownIds = useMemo(() => new Set(shown.map((item) => item.id)), [shown]);
  const missingKey = selectedMediaIds.filter((id) => !shownIds.has(id)).join(",");
  const keep = (items: MediaListItem[]) => setFetched((previous) => mergeMediaItems(previous, items));

  useEffect(() => {
    if (!missingKey) return;
    let cancelled = false;
    void fetchPreviews(missingKey.split(",")).then((items) => {
      if (!cancelled) setFetched((previous) => mergeMediaItems(previous, items));
    });
    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  useOnAdminDataChange(() => void fetchPreviews(fetched.map((item) => item.id)).then(keep));

  return fetched;
}

export function usePrivateGalleryMediaPicker(selectedMediaIds: string[]) {
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const activeSearch = searchValue.trim();
  const mode = activeSearch ? "search" : "browse";

  const onError = useCallback((message: string) => setError(message), []);
  const browse = useMediaBrowse(onError);
  const search = useRefreshingPages(
    activeSearch
      ? {
          key: activeSearch,
          filters: { ...NO_FILTERS, query: activeSearch },
          startCursor: null,
          autoLoadAfterMs: SEARCH_DEBOUNCE_MS,
        }
      : null,
    onError
  );
  const view = mode === "browse" ? browse : search;
  const selectedItems = useSelectedPreviews(selectedMediaIds, view.items);

  const selectedIdSet = useMemo(() => new Set(selectedMediaIds), [selectedMediaIds]);

  const selectedMediaShelfItems = useMemo(() => {
    if (mode !== "browse") return [];
    const byId = new Map<string, MediaListItem>();
    for (const item of selectedItems) byId.set(item.id, item);
    const visibleIds = new Set(view.items.map((item) => item.id));
    return selectedMediaIds.flatMap((id) => {
      const item = byId.get(id);
      return item && !visibleIds.has(id) ? [item] : [];
    });
  }, [mode, selectedItems, selectedMediaIds, view.items]);

  async function loadMore() {
    if (!view.nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      await view.loadMore();
    } catch (e: unknown) {
      setError(errorMessage(e, "Failed to load media."));
    } finally {
      setLoadingMore(false);
    }
  }

  return {
    items: view.items,
    selectedIdSet,
    selectedMediaShelfItems,
    searchValue,
    mode,
    hasSearch: mode === "search",
    nextCursor: view.nextCursor,
    loading: view.loading,
    loadingMore,
    error,
    setSearchValue,
    clearSearch: () => setSearchValue(""),
    loadMore,
  };
}
