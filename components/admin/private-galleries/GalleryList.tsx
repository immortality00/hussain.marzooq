"use client";

import type { MouseEvent } from "react";
import { AdminSearchBox } from "@/components/admin/AdminSearchBox";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { useListReturn } from "@/hooks/useListReturn";
import { GALLERY_LIST } from "./gallery-list";
import type { GalleryItem } from "./types";
import { galleryPath, getGalleryStatus } from "./helpers";

type GalleryListProps = {
  items: GalleryItem[];
  // The search the list shows (its way back comes back to the same one).
  view: string;
  searchValue: string;
  deletingId: string | null;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onCopyLink: (item: GalleryItem) => void;
  onEdit: (id: string, event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (id: string) => void;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  selectAll: { checked: boolean; indeterminate: boolean; onChange: () => void };
};

export function GalleryList({
  items,
  view,
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
  useListReturn(GALLERY_LIST, view, true);

  return (
    <section className="mt-8 rounded-[2rem] border p-5">
      <StickyToolbar surface="admin" className="[--sticky-bleed:1.25rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Galleries</div>

          <AdminSearchBox
            value={searchValue}
            onValueChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="Search galleries..."
            className="w-full sm:w-80"
          />
        </div>
      </StickyToolbar>

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
        {items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
            No galleries yet.
          </div>
        ) : (
          items.map((item) => {
            const status = getGalleryStatus(item);
            const deleting = deletingId === item.id;
            const actionDisabled = Boolean(deletingId);

            return (
              <article key={item.id} className="rounded-[2rem] border p-4" data-list-row={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <BulkCheckbox
                      checked={isSelected(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      label={`Select ${item.title}`}
                      className="mt-1"
                    />
                    <div className="min-w-0 wrap-anywhere">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">{item.title}</div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span className="inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.visibility === "public" ? "Public" : "Private"}
                      </span>
                      {deleting ? (
                        <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                          Processing
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {galleryPath(item.slug, item.linkKey ? "…" : null)} • {item.mediaIds.length} media •{" "}
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
                      onClick={() => onCopyLink(item)}
                      className={adminButtonClasses("default", "md")}
                    >
                      Copy link
                    </button>

                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={(event) => onEdit(item.id, event)}
                      className={adminButtonClasses("default", "md")}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() => onDelete(item.id)}
                      className={adminButtonClasses("danger", "md")}
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