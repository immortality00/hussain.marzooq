"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SearchInput } from "@/components/search/SearchInput";
import { TagChipRow, type TagChip } from "@/components/media/TagChipRow";
import MediaGridResults from "@/components/media/MediaGridResults";
import MediaLightbox from "@/components/media/MediaLightbox";
import type { MediaItem, TagLink } from "@/components/media/types";
import { useMediaSearch } from "@/components/media/useMediaSearch";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import ModeSwitcher, { type ViewerMode } from "./ModeSwitcher";

const PhotographyCylinder = dynamic(() => import("./PhotographyCylinder"), { ssr: false });
const PhotographyHorizontal = dynamic(() => import("./PhotographyHorizontal"), { ssr: false });

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
  tagLinks?: Record<string, TagLink>;
  navChips?: TagChip[];
}) {
  const [mode, setMode] = useState<ViewerMode>("cylinder");
  const [active, setActive] = useState<MediaItem | null>(null);

  const {
    q,
    setQ,
    displayedItems,
    isSearching,
    searchError,
    isLoadingMore,
    canLoadMore,
    loadMore,
  } = useMediaSearch({ items, mediaMode: "image", searchCategory, lockedTag });

  useModalNavbarLock(Boolean(active));

  // All three views work on every breakpoint — the cylinder included. There is
  // deliberately no viewport gate here: gating on a post-mount matchMedia check
  // made the first paint render the grid, then swap to the cylinder.
  const showLoadMore = canLoadMore;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        <ModeSwitcher mode={mode} onChange={setMode} />
        <div className="min-w-0 flex-1 sm:order-last sm:w-64 sm:flex-none">
          <SearchInput
            value={q}
            onValueChange={setQ}
            onClear={() => setQ("")}
            placeholder="Search…"
          />
        </div>
        {navChips?.length ? (
          <div className="order-last min-w-0 basis-full sm:order-none sm:ml-12 sm:basis-0 sm:flex-1">
            <TagChipRow chips={navChips} activeSlug={lockedTag} scroll boxed />
          </div>
        ) : null}
      </div>

      <div className="mt-1">
        {mode === "cylinder" ? (
          <PhotographyCylinder items={displayedItems} onSelect={setActive} />
        ) : mode === "horizontal" ? (
          <PhotographyHorizontal
            key={displayedItems.map((m) => m.id).join(",")}
            items={displayedItems}
            onSelect={setActive}
          />
        ) : (
          <MediaGridResults
            items={displayedItems}
            onSelect={setActive}
            mediaMode="image"
            isSearching={isSearching}
            searchError={searchError}
            showLoadMore={showLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void loadMore()}
          />
        )}
      </div>

      {active ? (
        <MediaLightbox active={active} onClose={() => setActive(null)} tagLinks={tagLinks} />
      ) : null}
    </div>
  );
}
