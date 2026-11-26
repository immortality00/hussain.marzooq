"use client";

import dynamic from "next/dynamic";
import { usePersistedChoice } from "@/hooks/usePersistedChoice";
import { SearchInput } from "@/components/search/SearchInput";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { TagChipRow, type TagChip } from "@/components/media/TagChipRow";
import MediaGridResults from "@/components/media/MediaGridResults";
import MediaLightbox from "@/components/media/MediaLightbox";
import type { MediaItem, TagLinks } from "@/components/media/types";
import { useMediaSearch } from "@/components/media/useMediaSearch";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import { usePopupSequence } from "@/components/shared/popup-sequence/usePopupSequence";
import { preloadMediaPopup } from "@/lib/client/preload-popup-image";
import { useListGeneration } from "@/hooks/useListGeneration";
import ModeSwitcher, {
  VIEWER_MODE_STORAGE_KEY,
  isViewerMode,
  type ViewerMode,
} from "./ModeSwitcher";
import { CYLINDER_HEIGHT, HORIZONTAL_HEIGHT } from "./viewer-heights";

const PhotographyCylinder = dynamic(() => import("./PhotographyCylinder"), {
  ssr: false,
  loading: () => <LoadingScreen className={CYLINDER_HEIGHT} />,
});
const PhotographyHorizontal = dynamic(() => import("./PhotographyHorizontal"), {
  ssr: false,
  loading: () => <LoadingScreen className={HORIZONTAL_HEIGHT} />,
});

export default function PhotographyViewer({
  items,
  searchCategory = "photography",
  lockedTag,
  tagLinks,
  navChips,
}: {
  items: MediaItem[];
  searchCategory?: string;
  lockedTag?: string;
  tagLinks?: TagLinks;
  navChips?: TagChip[];
}) {
  const [mode, setMode] = usePersistedChoice<ViewerMode>(
    VIEWER_MODE_STORAGE_KEY,
    "cylinder",
    isViewerMode
  );
  const {
    q,
    setQ,
    clearQ,
    displayedItems,
    isSearching,
    searchError,
    isLoadingMore,
    canLoadMore,
    loadMore,
  } = useMediaSearch({ items, mediaMode: "image", searchCategory, lockedTag, loadAll: mode !== "grid" });
  const popup = usePopupSequence(displayedItems, {
    more: { canLoadMore, isLoadingMore, failed: Boolean(searchError), loadMore },
    preload: preloadMediaPopup,
  });

  useModalNavbarLock(Boolean(popup.active));
  // Starts the views over only for a new list, never while more photos arrive.
  const listGeneration = useListGeneration(displayedItems.map((m) => m.id));

  // All three views work on every breakpoint — the cylinder included. There is
  // deliberately no viewport gate here: gating on a post-mount matchMedia check
  // made the first paint render the grid, then swap to the cylinder.
  const showLoadMore = canLoadMore;

  return (
    <div className="mt-5">
      <StickyToolbar>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="min-w-0 flex-1 sm:order-last sm:w-64 sm:flex-none">
            <SearchInput
              value={q}
              onValueChange={setQ}
              onClear={clearQ}
              placeholder="Search…"
            />
          </div>
          {navChips?.length ? (
            <div className="order-last min-w-0 basis-full sm:order-none sm:ml-12 sm:basis-0 sm:flex-1">
              <TagChipRow chips={navChips} activeSlug={lockedTag} scroll boxed />
            </div>
          ) : null}
        </div>
      </StickyToolbar>

      <div className="mt-1">
        {mode === "cylinder" ? (
          <PhotographyCylinder key={listGeneration} items={displayedItems} onSelect={popup.open} />
        ) : mode === "horizontal" ? (
          <PhotographyHorizontal
            key={listGeneration}
            items={displayedItems}
            onSelect={popup.open}
          />
        ) : (
          <MediaGridResults
            items={displayedItems}
            onSelect={popup.open}
            mediaMode="image"
            isSearching={isSearching}
            searchError={searchError}
            showLoadMore={showLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void loadMore()}
          />
        )}
      </div>

      {popup.active ? (
        <MediaLightbox active={popup.active} nav={popup.nav} onClose={popup.close} tagLinks={tagLinks} />
      ) : null}
    </div>
  );
}
