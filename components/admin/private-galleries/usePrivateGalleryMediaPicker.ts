"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminSearch } from "@/components/admin/shared/useAdminSearch";
import type { MediaItem } from "./types";
import { buildMediaQuery, mergeMediaItems, type MediaListResponse } from "./media-picker-utils";

export function usePrivateGalleryMediaPicker(selectedMediaIds: string[]) {
  const search = useAdminSearch();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const selectedIdSet = useMemo(() => new Set(selectedMediaIds), [selectedMediaIds]);

  const selectedMedia = useMemo(() => {
    const byId = new Map<string, MediaItem>();
    for (const item of selectedItems) byId.set(item.id, item);
    for (const item of items) byId.set(item.id, item);

    return selectedMediaIds
      .map((id) => byId.get(id))
      .filter((item): item is MediaItem => Boolean(item));
  }, [items, selectedItems, selectedMediaIds]);

  const selectedMediaListItems = useMemo(() => {
    const currentPageIds = new Set(items.map((item) => item.id));
    return selectedMedia.filter((item) => !currentPageIds.has(item.id));
  }, [items, selectedMedia]);

  const loadMedia = useCallback(
    async ({ q, cursor, append }: { q: string; cursor?: string | null; append: boolean }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildMediaQuery({ q, cursor }), { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as MediaListResponse | null;

        if (requestId !== requestIdRef.current) return;

        if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
          setError(data?.error ?? "Failed to load media.");
          return;
        }

        setItems((prev) => (append ? mergeMediaItems(prev, data.items ?? []) : data.items ?? []));
        setNextCursor(data.nextCursor ?? null);
      } catch {
        if (requestId === requestIdRef.current) setError("Failed to load media.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadMedia({ q: "", append: false });
  }, [loadMedia]);

  useEffect(() => {
    const missingIds = selectedMediaIds.filter(
      (id) =>
        !selectedItems.some((item) => item.id === id) && !items.some((item) => item.id === id)
    );

    if (missingIds.length === 0) return;

    let cancelled = false;

    async function loadSelectedMedia() {
      try {
        const res = await fetch(buildMediaQuery({ ids: missingIds }), { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as MediaListResponse | null;

        if (cancelled || !res.ok || !data?.ok || !Array.isArray(data.items)) return;
        setSelectedItems((prev) => mergeMediaItems(prev, data.items ?? []));
      } catch {
        // Save validation is server-side. This fetch only hydrates selected previews.
      }
    }

    void loadSelectedMedia();

    return () => {
      cancelled = true;
    };
  }, [items, selectedItems, selectedMediaIds]);

  function submitSearch() {
    search.submitSearch((q) => {
      void loadMedia({ q, append: false });
    });
  }

  function clearSearch() {
    search.clearSearch(() => {
      void loadMedia({ q: "", append: false });
    });
  }

  function loadMore() {
    if (!nextCursor) return;
    void loadMedia({ q: search.activeSearch, cursor: nextCursor, append: true });
  }

  return {
    items,
    selectedIdSet,
    selectedMediaListItems,
    searchValue: search.draftSearch,
    hasSearch: search.hasActiveSearch,
    nextCursor,
    loading,
    loadingMore,
    error,
    setSearchValue: search.setDraftSearch,
    submitSearch,
    clearSearch,
    loadMore,
  };
}