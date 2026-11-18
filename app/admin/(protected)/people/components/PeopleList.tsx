"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { AdminSearchBox } from "@/components/admin/AdminSearchBox";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import type { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { useListReturn } from "@/hooks/useListReturn";
import type { PersonItem } from "@/hooks/usePeopleAdmin";
import { PEOPLE_LIST } from "../lib/people-list";

function statusLabel(item: { isPublic: boolean; isPrivate: boolean }) {
  if (item.isPublic === false) return "Hidden";
  if (item.isPrivate) return "Password-protected";
  return "Public";
}

export function PeopleList({
  items,
  view,
  searchText,
  onSearchChange,
  onSearchClear,
  actionBusy,
  deletingId,
  bulkBusy,
  selection,
  onEdit,
  onDelete,
  onBulkDelete,
}: {
  items: PersonItem[];
  view: string;
  searchText: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  actionBusy: boolean;
  deletingId: string;
  bulkBusy: boolean;
  // Kept by the screen, so a selection survives opening a form and coming back.
  selection: ReturnType<typeof useBulkSelection>;
  onEdit: (item: PersonItem, event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
}) {
  useListReturn(PEOPLE_LIST, view, true);

  return (
    <section className="mt-8 rounded-[2rem] border p-5">
      <StickyToolbar surface="admin" className="[--sticky-bleed:1.25rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Profiles</div>

          <AdminSearchBox
            value={searchText}
            onValueChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="Search profiles..."
            className="w-full sm:w-80"
          />
        </div>
      </StickyToolbar>

      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selection.allSelected}
            indeterminate={selection.count > 0 && !selection.allSelected}
            onChange={selection.toggleAll}
            label="Select all profiles"
          />
          Select all
        </div>
      )}

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No profiles yet.</div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-[2rem] border p-4" data-list-row={item.id}>
              <div className="flex flex-wrap items-center gap-4">
                <BulkCheckbox
                  checked={selection.isSelected(item.id)}
                  onChange={() => selection.toggle(item.id)}
                  label={`Select ${item.name}`}
                />
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-muted">
                  {item.avatarUrl ? (
                    <Image src={item.avatarUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 text-sm font-medium wrap-anywhere">{item.name}</span>
                    {item.removalRequestedAt ? (
                      <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
                        Removal requested
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground wrap-anywhere">
                    /people/{item.slug} • {statusLabel(item)}
                  </div>
                </div>

                <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={(event) => onEdit(item, event)}
                    className={adminButtonClasses("default", "md")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => onDelete(item.id)}
                    className={adminButtonClasses("danger", "md")}
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[
          {
            label: "Delete",
            tone: "danger",
            onRun: async () => {
              await onBulkDelete(selection.selectedIds);
              selection.clear();
            },
          },
        ]}
      />
    </section>
  );
}
