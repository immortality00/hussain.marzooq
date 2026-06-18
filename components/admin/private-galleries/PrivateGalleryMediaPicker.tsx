"use client";

import { AdminSearchBar } from "@/components/admin/shared/AdminSearchBar";
import { PrivateGalleryMediaCard } from "./PrivateGalleryMediaCard";
import { usePrivateGalleryMediaPicker } from "./usePrivateGalleryMediaPicker";

type PrivateGalleryMediaPickerProps = {
  selectedMediaIds: string[];
  onToggleMedia: (id: string) => void;
};

export function PrivateGalleryMediaPicker({
  selectedMediaIds,
  onToggleMedia,
}: PrivateGalleryMediaPickerProps) {
  const picker = usePrivateGalleryMediaPicker(selectedMediaIds);

  return (
    <section className="rounded-[2rem] border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Select media</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {selectedMediaIds.length} selected. Search loads from the full media library, not only the first page.
          </div>
        </div>

        <AdminSearchBar
          value={picker.searchValue}
          placeholder="Search title, tags, location, people, event..."
          showClear={picker.hasSearch}
          onChange={picker.setSearchValue}
          onSubmit={picker.submitSearch}
          onClear={picker.clearSearch}
        />
      </div>

      {picker.error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          {picker.error}
        </div>
      ) : null}

      {picker.selectedMediaListItems.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Selected media outside current results
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picker.selectedMediaListItems.map((item) => (
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
          className="mt-5 rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {picker.loadingMore ? "Loading…" : "Load more media"}
        </button>
      ) : null}
    </section>
  );
}