"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { encodeMediaCursor, PUBLIC_MEDIA_PAGE_SIZE } from "@/lib/media-cursor";
import type { MediaItem } from "./types";

type PublicMediaSearchMode = "image" | "video";

type PublicMediaResponse = {
  items?: MediaItem[];
  nextCursor?: string | null;
  error?: string;
};

const SEARCH_LIMIT = 60;
const DEBOUNCE_MS = 250;

function buildSearchUrl({
  category,
  mode,
  query,
  tag,
  cursor,
}: {
  category: string;
  mode: PublicMediaSearchMode;
  query: string;
  tag: string;
  cursor?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("category", category);
  params.set("mode", mode);
  params.set("limit", String(SEARCH_LIMIT));

  const cleanQuery = query.trim();
  const cleanTag = tag.trim();

  if (cleanQuery) params.set("q", cleanQuery);
  if (cleanTag) params.set("tag", cleanTag);
  if (cursor) params.set("cursor", cursor);

  return `/api/media/list-public?${params.toString()}`;
}

function localFilterItems(items: MediaItem[], queryValue: string, tagValue: string) {
  const query = queryValue.trim().toLowerCase();

  return items.filter((m) => {
    const text = `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${m.event ?? ""} ${(m.tags ?? []).join(" ")} ${(m.people ?? []).join(" ")}`.toLowerCase();

    const matchesQuery = query ? text.includes(query) : true;
    const matchesTag = tagValue ? m.tags.includes(tagValue) : true;

    return matchesQuery && matchesTag;
  });
}

export function useMediaSearch({
  items,
  mediaMode = "image",
  searchCategory,
  lockedTag,
}: {
  items: MediaItem[];
  mediaMode?: PublicMediaSearchMode;
  searchCategory?: string;
  lockedTag?: string;
}) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [remoteItems, setRemoteItems] = useState<MediaItem[]>(items);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [browseHasMore, setBrowseHasMore] = useState(items.length >= PUBLIC_MEDIA_PAGE_SIZE);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState("");

  const requestIdRef = useRef(0);
  const hasDbSearch = Boolean(searchCategory);
  const cleanQuery = q.trim();
  const cleanTag = activeTag.trim();
  const cleanLockedTag = (lockedTag ?? "").trim();
  const hasActiveSearch = Boolean(cleanQuery || cleanTag);
  // On a tag subpage the items are already server-filtered to lockedTag; every
  // user-initiated search must stay scoped to it, so it's the tag sent to the
  // API when the user hasn't picked a chip.
  const effectiveTag = cleanTag || cleanLockedTag;

  useEffect(() => {
    setRemoteItems(items);
    setNextCursor(null);
    setBrowseHasMore(items.length >= PUBLIC_MEDIA_PAGE_SIZE);
  }, [items]);

  useEffect(() => {
    if (!hasDbSearch || !searchCategory) return;

    if (!hasActiveSearch) {
      requestIdRef.current += 1;
      setRemoteItems(items);
      setNextCursor(null);
      setBrowseHasMore(items.length >= PUBLIC_MEDIA_PAGE_SIZE);
      setIsSearching(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function runSearch() {
      setIsSearching(true);
      setSearchError("");

      try {
        const res = await fetch(
          buildSearchUrl({
            category: searchCategory as string,
            mode: mediaMode,
            query: cleanQuery,
            tag: effectiveTag,
          }),
          { cache: "no-store", signal: controller.signal }
        );

        const data = (await res.json().catch(() => null)) as PublicMediaResponse | null;
        if (!res.ok || !data || !Array.isArray(data.items)) {
          throw new Error(data?.error ?? "Search failed.");
        }

        if (requestIdRef.current !== requestId) return;

        setRemoteItems(data.items);
        setNextCursor(data.nextCursor ?? null);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (requestIdRef.current !== requestId) return;

        setSearchError(error instanceof Error ? error.message : "Search failed.");
      } finally {
        if (!controller.signal.aborted && requestIdRef.current === requestId) {
          setIsSearching(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void runSearch();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cleanQuery, cleanTag, effectiveTag, hasActiveSearch, hasDbSearch, items, mediaMode, searchCategory]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of remoteItems) {
      for (const t of it.tags) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [remoteItems]);

  const displayedItems = useMemo(() => {
    if (hasDbSearch && hasActiveSearch) return remoteItems;
    return localFilterItems(remoteItems, q, activeTag);
  }, [activeTag, hasActiveSearch, hasDbSearch, q, remoteItems]);

  // The same cursor path feeds both modes: an active search paginates the
  // server-filtered results; browsing paginates the recent-media pool by
  // building the next cursor from the last loaded item.
  const canLoadMore = hasDbSearch && (hasActiveSearch ? Boolean(nextCursor) : browseHasMore);

  async function loadMore() {
    if (!hasDbSearch || !searchCategory || isLoadingMore || !canLoadMore) return;

    let cursor: string | null;
    if (hasActiveSearch) {
      cursor = nextCursor;
    } else {
      const last = remoteItems[remoteItems.length - 1];
      cursor = last?.createdAt
        ? encodeMediaCursor({ createdAt: last.createdAt, id: last.id })
        : null;
      if (!cursor) {
        setBrowseHasMore(false);
        return;
      }
    }

    setIsLoadingMore(true);
    setSearchError("");

    try {
      const res = await fetch(
        buildSearchUrl({
          category: searchCategory,
          mode: mediaMode,
          query: cleanQuery,
          tag: effectiveTag,
          cursor,
        }),
        { cache: "no-store" }
      );

      const data = (await res.json().catch(() => null)) as PublicMediaResponse | null;
      if (!res.ok || !data || !Array.isArray(data.items)) {
        throw new Error(data?.error ?? "Could not load more media.");
      }

      setRemoteItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const fresh = data.items!.filter((item) => !seen.has(item.id));
        return [...prev, ...fresh];
      });

      if (hasActiveSearch) setNextCursor(data.nextCursor ?? null);
      else setBrowseHasMore(Boolean(data.nextCursor));
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Could not load more media.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return {
    q,
    setQ,
    activeTag,
    setActiveTag,
    allTags,
    displayedItems,
    isSearching,
    searchError,
    nextCursor,
    isLoadingMore,
    hasDbSearch,
    hasActiveSearch,
    canLoadMore,
    loadMore,
  };
}
