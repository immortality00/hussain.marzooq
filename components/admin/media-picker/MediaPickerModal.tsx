"use client";

import { SearchInput } from "@/components/search/SearchInput";
import { PrivateGalleryMediaCard } from "@/components/admin/private-galleries/PrivateGalleryMediaCard";
import { usePrivateGalleryMediaPicker } from "@/components/admin/private-galleries/usePrivateGalleryMediaPicker";
import type { SectionImage } from "@/lib/page-sections-shared";
import { adminButtonClasses } from "@/components/admin/AdminButton";

// Single-select image picker over the existing media library. Reuses the
// private-galleries picker hook + card (both generic); picking an image stores
// its URL with an empty publicId, since the media library — not this field —
// owns the asset.
export function MediaPickerModal({
  onPick,
  onClose,
}: {
  onPick: (image: SectionImage) => void;
  onClose: () => void;
}) {
  const picker = usePrivateGalleryMediaPicker([]);
  const images = picker.items.filter((item) => item.type === "image" && item.secureUrl);

  function pickById(id: string) {
    const item = picker.items.find((i) => i.id === id);
    if (item?.secureUrl) {
      onPick({ url: item.secureUrl, publicId: "" });
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <p className="text-sm font-semibold">Pick from media library</p>
          <button
            type="button"
            onClick={onClose}
            className={adminButtonClasses("default", "sm")}
          >
            Close
          </button>
        </div>

        <div className="border-b px-5 py-3">
          <SearchInput
            value={picker.searchValue}
            onValueChange={picker.setSearchValue}
            onClear={picker.clearSearch}
            placeholder="Search title, tags, location, people, event..."
            wrapperClassName="flex w-full flex-wrap gap-2"
            inputClassName="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            clearButtonClassName={adminButtonClasses("default", "md")}
          />
        </div>

        <div className="space-y-4 overflow-y-auto p-5" data-lenis-prevent>
          {picker.error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
              {picker.error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picker.loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading media…</div>
            ) : images.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No images found.</div>
            ) : (
              images.map((item) => (
                <PrivateGalleryMediaCard
                  key={item.id}
                  item={item}
                  selected={false}
                  onToggle={pickById}
                />
              ))
            )}
          </div>

          {picker.nextCursor ? (
            <button
              type="button"
              onClick={picker.loadMore}
              disabled={picker.loadingMore}
              className={adminButtonClasses("default", "md")}
            >
              {picker.loadingMore ? "Loading…" : "Load more media"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
