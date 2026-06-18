"use client";

import { AdminSearchBar } from "@/components/admin/shared/AdminSearchBar";
import type { GalleryItem } from "./types";
import { getGalleryStatus } from "./helpers";

type GalleryListProps = {
  items: GalleryItem[];
  loading: boolean;
  searchValue: string;
  showClearSearch: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onCopyLink: (slug: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function GalleryList({
  items,
  loading,
  searchValue,
  showClearSearch,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onCopyLink,
  onEdit,
  onDelete,
}: GalleryListProps) {
  return (
    <section className="mt-8 rounded-[2rem] border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium">Galleries</div>

        <AdminSearchBar
          value={searchValue}
          placeholder="Search galleries..."
          showClear={showClearSearch}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          onClear={onSearchClear}
          className="flex w-full flex-wrap gap-2 md:w-auto"
          inputClassName="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
            No galleries yet.
          </div>
        ) : (
          items.map((item) => {
            const status = getGalleryStatus(item);

            return (
              <article key={item.id} className="rounded-[2rem] border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">{item.title}</div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      /g/{item.slug} • {item.mediaIds.length} media •{" "}
                      {item.isActive ? "Enabled" : "Disabled"}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      Expires: {item.expiresAtLocal.replace("T", " ")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCopyLink(item.slug)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                    >
                      Copy link
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item.id)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}