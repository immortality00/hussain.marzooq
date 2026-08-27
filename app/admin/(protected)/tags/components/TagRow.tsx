"use client";

import { useSortableRow } from "@/components/admin/sortable/SortableList";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import type { Tag, TagPatch } from "../lib/types";

export default function TagRow({
  tag,
  selected,
  onToggleSelect,
  onEdit,
  onToggle,
  onDelete,
}: {
  tag: Tag;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: (id: string, patch: TagPatch) => void;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (tag: Tag) => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(tag.id);

  return (
    <div ref={setNodeRef} style={style} className="border-b p-4">
      <div className="flex items-start gap-3">
        <BulkCheckbox
          checked={selected}
          onChange={onToggleSelect}
          label={`Select ${tag.label}`}
          className="mt-1"
        />
        <button
          type="button"
          {...handleProps}
          className="mt-1 shrink-0 cursor-grab rounded-lg border px-2 py-1 text-xs opacity-80 hover:opacity-100"
          title="Drag"
        >
          ⠿
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              defaultValue={tag.label}
              className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== tag.label) onEdit(tag.id, { label: v });
              }}
              placeholder="Label"
            />
            <input
              defaultValue={tag.slug}
              className="w-full rounded-lg border bg-background px-2 py-1 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== tag.slug) onEdit(tag.id, { slug: v });
              }}
              placeholder="slug"
            />
          </div>

          <input
            defaultValue={tag.description}
            className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== tag.description) onEdit(tag.id, { description: v });
            }}
            placeholder="Description (optional)"
          />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={tag.isActive} onChange={(e) => onToggle(tag.id, e.target.checked)} />
            <span className="text-muted-foreground">{tag.isActive ? "Active" : "Hidden"}</span>
          </label>

          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {tag.mediaCount} media
          </span>

          <button
            type="button"
            className="rounded-lg border px-2 py-1 text-xs transition-colors hover:bg-red-500/10"
            onClick={() => onDelete(tag)}
            title={tag.mediaCount > 0 ? "Delete (will ask to detach from media)" : "Delete tag"}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
