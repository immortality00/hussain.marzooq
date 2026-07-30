"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SearchInput } from "@/components/search/SearchInput";
import MediaTagChips from "@/components/media/MediaTagChips";
import MediaGridResults from "@/components/media/MediaGridResults";
import MediaLightbox from "@/components/media/MediaLightbox";
import type { MediaItem } from "@/components/media/types";
import { useMediaSearch } from "@/components/media/useMediaSearch";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import ModeSwitcher, { type ViewerMode } from "./ModeSwitcher";

const PhotographyCylinder = dynamic(() => import("./PhotographyCylinder"), { ssr: false });
const PhotographyHorizontal = dynamic(() => import("./PhotographyHorizontal"), { ssr: false });

export default function PhotographyViewer({
  items,
  searchCategory = "photography",
}: {
  items: MediaItem[];
  searchCategory?: string;
}) {
  const [mode, setMode] = useState<ViewerMode>("cylinder");
  const [isDesktop, setIsDesktop] = useState(false);
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
  } = useMediaSearch({ items, mediaMode: "image", searchCategory });

  useModalNavbarLock(Boolean(active));

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Mobile always uses the responsive grid (Mode 1 → grid fallback).
  const effectiveMode: ViewerMode = isDesktop ? mode : "grid";
  const showLoadMore = Boolean(searchCategory) && hasActiveSearch && Boolean(nextCursor);

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <ModeSwitcher mode={mode} onChange={setMode} className="hidden md:inline-flex" />
        <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:flex-nowrap">
          <MediaTagChips activeTag={activeTag} setActiveTag={setActiveTag} allTags={allTags} />
          <div className="w-full sm:w-64 sm:shrink-0">
            <SearchInput
              value={q}
              onValueChange={setQ}
              onClear={() => setActiveTag("")}
              placeholder="Search…"
            />
          </div>
        </div>
      </div>

      {effectiveMode === "cylinder" ? (
        <PhotographyCylinder items={displayedItems} onSelect={setActive} />
      ) : effectiveMode === "horizontal" ? (
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

      {active ? <MediaLightbox active={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
