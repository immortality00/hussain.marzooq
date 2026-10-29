"use client";

import { MediaListFilterBar } from "@/app/admin/(protected)/media/list/components/MediaListFilterBar";
import { PrivateGalleryMediaCard } from "./PrivateGalleryMediaCard";
import { usePrivateGalleryMediaPicker } from "./usePrivateGalleryMediaPicker";
import type { BulkSelectHandlers } from "./useSelectAllMatches";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { adminButtonClasses } from "@/components/admin/AdminButton";

type PrivateGalleryMediaPickerProps = BulkSelectHandlers & {
  selectedMediaIds: string[];
  onToggleMedia: (id: string) => void;
};

export function PrivateGalleryMediaPicker({
  selectedMediaIds,
  onToggleMedia,
  onSelectMedia,
  onDeselectMedia,
}: PrivateGalleryMediaPickerProps) {
  const picker = usePrivateGalleryMediaPicker(selectedMediaIds, { onSelectMedia, onDeselectMedia });
  const { filters } = picker;

  return (
    <section className="rounded-[2rem] border p-5">
      <div className="text-sm font-medium">Select media</div>
      <div className="mt-1 text-xs text-muted-foreground">{selectedMediaIds.length} selected.</div>

      <MediaListFilterBar
        query={filters.query}
        categoryFilter={filters.category}
        typeFilter={filters.type}
        visibilityFilter={filters.visibility}
        disabled={false}
        className="mt-4 [--sticky-bleed:1.25rem]"
        onQueryChange={(value) => picker.setFilter("query", value)}
        onCategoryChange={(value) => picker.setFilter("category", value)}
        onTypeChange={(value) => picker.setFilter("type", value)}
        onVisibilityChange={(value) => picker.setFilter("visibility", value)}
        onReset={picker.clearFilters}
      />

      {picker.selectAll.visible ? (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={picker.selectAll.checked}
            indeterminate={picker.selectAll.indeterminate}
            onChange={picker.selectAll.toggle}
            label="Select all media"
          />
          Select all
        </div>
      ) : null}

      {picker.selectAll.note ? (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          {picker.selectAll.note}
        </div>
      ) : null}

      {picker.error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          {picker.error}
        </div>
      ) : null}

      {picker.selectedMediaShelfItems.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Selected media outside current page
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picker.selectedMediaShelfItems.map((item) => (
              <PrivateGalleryMediaCard
                key={item.id}
                item={item}
                selected
                onToggle={onToggleMedia}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picker.loading ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading media…</div>
        ) : picker.items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
            No media found.
          </div>
        ) : (
          picker.items.map((item) => (
            <PrivateGalleryMediaCard
              key={item.id}
              item={item}
              selected={picker.selectedIdSet.has(item.id)}
              onToggle={onToggleMedia}
            />
          ))
        )}
      </div>

      {picker.nextCursor ? (
        <button
          type="button"
          onClick={picker.loadMore}
          disabled={picker.loadingMore}
          className={adminButtonClasses("default", "md", "mt-5")}
        >
          {picker.loadingMore ? "Loading…" : "Load more media"}
        </button>
      ) : null}
    </section>
  );
}
