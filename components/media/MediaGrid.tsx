"use client";

import MediaFilterBar from "./MediaFilterBar";
import MediaGridResults from "./MediaGridResults";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem, TagLinks } from "./types";
import type { TagChip } from "./TagChipRow";
import { useMediaSearch } from "./useMediaSearch";
import { useModalNavbarLock } from "./useModalNavbarLock";
import { usePopupSequence } from "@/components/shared/popup-sequence/usePopupSequence";
import { preloadMediaPopup } from "@/lib/client/preload-popup-image";

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
  tagLinks?: TagLinks;
  navChips?: TagChip[];
}) {
  const {
    q,
    setQ,
    clearQ,
    activeTag,
    setActiveTag,
    allTags,
    displayedItems,
    isSearching,
    searchError,
    isLoadingMore,
    canLoadMore,
    loadMore,
  } = useMediaSearch({ items, mediaMode, searchCategory, lockedTag });
  const popup = usePopupSequence(displayedItems, {
    more: { canLoadMore, isLoadingMore, failed: Boolean(searchError), loadMore },
    preload: preloadMediaPopup,
  });

  useModalNavbarLock(Boolean(popup.active));

  const showLoadMore = canLoadMore;

  return (
    <div
      id={mediaMode === "video" ? "videos" : undefined}
      className={`mt-10 scroll-mt-24 ${navChips ? "space-y-8" : "space-y-6"}`}
    >
      <MediaFilterBar
        q={q}
        setQ={setQ}
        clearQ={clearQ}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        allTags={allTags}
        showTagChips={!lockedTag}
        navChips={navChips}
        activeTagSlug={lockedTag}
      />

      <MediaGridResults
        items={displayedItems}
        onSelect={popup.open}
        mediaMode={mediaMode}
        isSearching={isSearching}
        searchError={searchError}
        showLoadMore={showLoadMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
      />

      {popup.active ? (
        <MediaLightbox active={popup.active} nav={popup.nav} onClose={popup.close} tagLinks={tagLinks} />
      ) : null}
    </div>
  );
}
