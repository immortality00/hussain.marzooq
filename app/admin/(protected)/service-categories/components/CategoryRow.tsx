"use client";

import { useSortableRow } from "@/components/admin/sortable/SortableList";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { Category, CategoryPatch } from "../lib/types";

export default function CategoryRow({
  category,
  selected,
  onToggleSelect,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: (id: string, patch: CategoryPatch) => Promise<boolean>;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (cat: Category) => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(category.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm"
    >
      <div className="col-span-1 flex flex-col items-start gap-1.5">
        <BulkCheckbox checked={selected} onChange={onToggleSelect} label={`Select ${category.name}`} />
        <button
          type="button"
          {...handleProps}
          className="cursor-grab rounded-lg border px-2 py-1 text-xs opacity-80 hover:opacity-100"
          title="Drag"
        >
          ⠿
        </button>
      </div>

      <div className="col-span-3">
        <input
          key={category.name}
          defaultValue={category.name}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={async (e) => {
            const input = e.target;
            const v = input.value.trim();
            if (v && v !== category.name) {
              const ok = await onEdit(category.id, { name: v });
              if (!ok) input.value = category.name;
            }
          }}
          disabled={category.isSystem}
        />
      </div>

      <div className="col-span-3">
        <input
          key={category.slug}
          defaultValue={category.slug}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={async (e) => {
            const input = e.target;
            const v = input.value.trim();
            if (v && v !== category.slug) {
              const ok = await onEdit(category.id, { slug: v });
              if (!ok) input.value = category.slug;
            }
          }}
          disabled={category.isSystem}
        />
      </div>

      <div className="col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={category.isActive} onChange={(e) => onToggle(category.id, e.target.checked)} />
          <span className="text-muted-foreground">{category.isActive ? "Yes" : "No"}</span>
        </label>
      </div>

      <div className="col-span-1 text-muted-foreground">{category.order}</div>
      <div className="col-span-1 text-muted-foreground">{category.servicesCount}</div>

      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          className={adminButtonClasses("danger", "xs")}
          onClick={() => onDelete(category)}
          disabled={category.isSystem || category.servicesCount > 0}
          title={
            category.isSystem
              ? "System category cannot be deleted"
              : category.servicesCount > 0
                ? "Delete services first"
                : "Delete category"
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
}
