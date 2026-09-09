"use client";

import MediaCardGrid from "./MediaCardGrid";
import { Button } from "@/components/shared/Button";
import type { MediaItem } from "./types";

export default function MediaGridResults({
  items,
  onSelect,
  mediaMode = "image",
  isSearching,
  searchError,
  showLoadMore = false,
  isLoadingMore = false,
  onLoadMore,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  mediaMode?: "image" | "video";
  isSearching?: boolean;
  searchError?: string;
  showLoadMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  return (
    <div className="space-y-6">
      {searchError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          {searchError}
        </div>
      ) : null}

      {isSearching ? (
        <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Searching…</div>
      ) : null}

      <MediaCardGrid items={items} onSelect={onSelect} mediaMode={mediaMode} />

      {showLoadMore ? (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
