"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import type { MediaItem } from "./types";
import { buildMediaQuery, mergeMediaItems, type MediaListResponse } from "./media-picker-utils";

const SEARCH_DEBOUNCE_MS = 250;

type PickerMode = "browse" | "search";

type Page = { query: string; items: MediaItem[]; nextCursor: string | null };

export function usePrivateGalleryMediaPicker(selectedMediaIds: string[]) {
  const [library] = useAdminSlice("media");
  const [browseMore, setBrowseMore] = useState<Page | null>(null);
  const [searchPage, setSearchPage] = useState<Page>({ query: "", items: [], nextCursor: null });
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const activeSearch = searchValue.trim();
  const mode: PickerMode = activeSearch ? "search" : "browse";

  const browse = useMemo<Page>(
    () => ({
      query: "",
      items: browseMore ? mergeMediaItems(library.items, browseMore.items) : library.items,
      nextCursor: browseMore ? browseMore.nextCursor : library.nextCursor,
    }),
    [library, browseMore]
  );
  const { items, nextCursor } = mode === "browse" ? browse : searchPage;
  const searching = mode === "search" && (loading || searchPage.query !== activeSearch);

  const selectedIdSet = useMemo(() => new Set(selectedMediaIds), [selectedMediaIds]);

  const selectedMedia = useMemo(() => {
    const byId = new Map<string, MediaItem>();

    for (const item of selectedItems) byId.set(item.id, item);
    for (const item of items) byId.set(item.id, item);

    return selectedMediaIds
      .map((id) => byId.get(id))
      .filter((item): item is MediaItem => Boolean(item));
  }, [items, selectedItems, selectedMediaIds]);

  const selectedMediaShelfItems = useMemo(() => {
    if (mode !== "browse") return [];

    const visibleIds = new Set(items.map((item) => item.id));
    return selectedMedia.filter((item) => !visibleIds.has(item.id));
  }, [items, mode, selectedMedia]);

  const loadMedia = useCallback(async ({ q, cursor }: { q: string; cursor?: string | null }) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const append = Boolean(cursor);

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

      const page = { query: q, items: data.items, nextCursor: data.nextCursor ?? null };
      if (!q) {
        setBrowseMore((prev) => ({ ...page, items: mergeMediaItems(prev?.items ?? [], page.items) }));
      } else {
        setSearchPage((prev) => (append ? { ...page, items: mergeMediaItems(prev.items, page.items) } : page));
      }
    } catch {
      if (requestId === requestIdRef.current) setError("Failed to load media.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!activeSearch) return;
    const timer = window.setTimeout(() => {
      void loadMedia({ q: activeSearch });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeSearch, loadMedia]);

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

  function clearSearch() {
    setSearchValue("");
  }

  function loadMore() {
    if (!nextCursor) return;
    void loadMedia({ q: activeSearch, cursor: nextCursor });
  }

  return {
    items,
    selectedIdSet,
    selectedMediaShelfItems,
    searchValue,
    mode,
    hasSearch: mode === "search",
    nextCursor,
    loading: searching,
    loadingMore,
    error,
    setSearchValue,
    clearSearch,
    loadMore,
  };
}