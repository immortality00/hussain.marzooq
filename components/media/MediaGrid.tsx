"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaCardGrid from "./MediaCardGrid";
import MediaFilterBar from "./MediaFilterBar";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem } from "./types";
import { useModalNavbarLock } from "./useModalNavbarLock";

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

export function MediaGrid({
  items,
  mediaMode = "image",
  searchCategory,
}: {
  items: MediaItem[];
  mediaMode?: "image" | "video";
  searchCategory?: string;
}) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [active, setActive] = useState<MediaItem | null>(null);
  const [remoteItems, setRemoteItems] = useState<MediaItem[]>(items);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState("");

  const requestIdRef = useRef(0);
  const hasDbSearch = Boolean(searchCategory);
  const cleanQuery = q.trim();
  const cleanTag = activeTag.trim();
  const hasActiveSearch = Boolean(cleanQuery || cleanTag);

  useModalNavbarLock(Boolean(active));

  useEffect(() => {
    setRemoteItems(items);
    setNextCursor(null);
  }, [items]);

  useEffect(() => {
    if (!hasDbSearch || !searchCategory) return;

    if (!hasActiveSearch) {
      requestIdRef.current += 1;
      setRemoteItems(items);
      setNextCursor(null);
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
            tag: cleanTag,
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
  }, [cleanQuery, cleanTag, hasActiveSearch, hasDbSearch, items, mediaMode, searchCategory]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of hasActiveSearch ? remoteItems : items) {
      for (const t of it.tags) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [hasActiveSearch, items, remoteItems]);

  const displayedItems = useMemo(() => {
    if (hasDbSearch && hasActiveSearch) return remoteItems;
    return localFilterItems(items, q, activeTag);
  }, [activeTag, hasActiveSearch, hasDbSearch, items, q, remoteItems]);

  async function loadMore() {
    if (!hasDbSearch || !searchCategory || !nextCursor || isLoadingMore || !hasActiveSearch) return;

    setIsLoadingMore(true);
    setSearchError("");

    try {
      const res = await fetch(
        buildSearchUrl({
          category: searchCategory,
          mode: mediaMode,
          query: cleanQuery,
          tag: cleanTag,
          cursor: nextCursor,
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
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Could not load more media.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div id={mediaMode === "video" ? "videos" : undefined} className="mt-10 space-y-6 scroll-mt-24">
      <MediaFilterBar
        q={q}
        setQ={setQ}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        allTags={allTags}
      />

      {searchError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          {searchError}
        </div>
      ) : null}

      {isSearching ? (
        <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Searching…</div>
      ) : null}

      <MediaCardGrid items={displayedItems} onSelect={setActive} mediaMode={mediaMode} />

      {hasDbSearch && hasActiveSearch && nextCursor ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
            className="rounded-full border px-5 py-2 text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {active ? <MediaLightbox active={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
