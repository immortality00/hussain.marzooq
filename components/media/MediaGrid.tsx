"use client";

import { useState } from "react";
import MediaFilterBar from "./MediaFilterBar";
import MediaGridResults from "./MediaGridResults";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem } from "./types";
import { useMediaSearch } from "./useMediaSearch";
import { useModalNavbarLock } from "./useModalNavbarLock";

export function MediaGrid({
  items,
  mediaMode = "image",
  searchCategory,
}: {
  items: MediaItem[];
  mediaMode?: "image" | "video";
  searchCategory?: string;
}) {
  const [active, setActive] = useState<MediaItem | null>(null);

  const {
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
    hasActiveSearch,
    loadMore,
  } = useMediaSearch({ items, mediaMode, searchCategory });

  useModalNavbarLock(Boolean(active));

  const showLoadMore = Boolean(searchCategory) && hasActiveSearch && Boolean(nextCursor);

  return (
    <div id={mediaMode === "video" ? "videos" : undefined} className="mt-10 space-y-6 scroll-mt-24">
      <MediaFilterBar
        q={q}
        setQ={setQ}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        allTags={allTags}
      />

      <MediaGridResults
        items={displayedItems}
        onSelect={setActive}
        mediaMode={mediaMode}
        isSearching={isSearching}
        searchError={searchError}
        showLoadMore={showLoadMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
      />

      {active ? <MediaLightbox active={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
