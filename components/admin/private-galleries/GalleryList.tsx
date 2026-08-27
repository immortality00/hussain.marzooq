"use client";

import { SearchInput } from "@/components/search/SearchInput";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import type { GalleryItem } from "./types";
import { getGalleryStatus } from "./helpers";

type GalleryListProps = {
  items: GalleryItem[];
  loading: boolean;
  searchValue: string;
  deletingId: string | null;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onCopyLink: (slug: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  selectAll: { checked: boolean; indeterminate: boolean; onChange: () => void };
};

export function GalleryList({
  items,
  loading,
  searchValue,
  deletingId,
  onSearchChange,
  onSearchClear,
  onCopyLink,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
  selectAll,
}: GalleryListProps) {
  return (
    <section className="mt-8 rounded-[2rem] border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium">Galleries</div>

        <SearchInput
          value={searchValue}
          onValueChange={onSearchChange}
          onClear={onSearchClear}
          placeholder="Search galleries..."
          wrapperClassName="flex w-full flex-wrap gap-2 md:w-auto"
          inputClassName="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          clearButtonClassName="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
        />
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selectAll.checked}
            indeterminate={selectAll.indeterminate}
            onChange={selectAll.onChange}
            label="Select all galleries"
          />
          Select all
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
            No galleries yet.
          </div>
        ) : (
          items.map((item) => {
            const status = getGalleryStatus(item);
            const deleting = deletingId === item.id;
            const actionDisabled = Boolean(deletingId);

            return (
              <article key={item.id} className="rounded-[2rem] border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <BulkCheckbox
                      checked={isSelected(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      label={`Select ${item.title}`}
                      className="mt-1"
                    />
                    <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">{item.title}</div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {deleting ? (
                        <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                          Processing
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      /g/{item.slug} • {item.mediaIds.length} media •{" "}
                      {item.isActive ? "Enabled" : "Disabled"}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      Expires: {item.expiresAtLocal.replace("T", " ")}
                    </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() => onCopyLink(item.slug)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Copy link
                    </button>

                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() => onEdit(item.id)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() => onDelete(item.id)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting ? "Deleting…" : "Delete"}
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