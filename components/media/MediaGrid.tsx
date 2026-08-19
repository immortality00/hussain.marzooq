"use client";

import { useState } from "react";
import MediaFilterBar from "./MediaFilterBar";
import MediaGridResults from "./MediaGridResults";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem, TagLink } from "./types";
import type { TagChip } from "./TagChipRow";
import { useMediaSearch } from "./useMediaSearch";
import { useModalNavbarLock } from "./useModalNavbarLock";

export function MediaGrid({
  items,
  mediaMode = "image",
  searchCategory,
  lockedTag,
  tagLinks,
  navChips,
}: {
  items: MediaItem[];
  mediaMode?: "image" | "video";
  searchCategory?: string;
  lockedTag?: string;
  tagLinks?: Record<string, TagLink>;
  navChips?: TagChip[];
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
  } = useMediaSearch({ items, mediaMode, searchCategory, lockedTag });

  useModalNavbarLock(Boolean(active));

  const showLoadMore = Boolean(searchCategory) && hasActiveSearch && Boolean(nextCursor);

  return (
    <div
      id={mediaMode === "video" ? "videos" : undefined}
      className={`mt-10 scroll-mt-24 ${navChips ? "space-y-8" : "space-y-6"}`}
    >
      <MediaFilterBar
        q={q}
        setQ={setQ}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        allTags={allTags}
        showTagChips={!lockedTag}
        navChips={navChips}
        activeTagSlug={lockedTag}
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

      {active ? (
        <MediaLightbox active={active} onClose={() => setActive(null)} tagLinks={tagLinks} />
      ) : null}
    </div>
  );
}
