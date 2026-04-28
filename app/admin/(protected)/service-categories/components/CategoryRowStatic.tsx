"use client";

import type { Category, CategoryPatch } from "../lib/types";

export default function CategoryRowStatic({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  onEdit: (id: string, patch: CategoryPatch) => void;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm">
      <div className="col-span-1 flex items-center">
        <span className="rounded-lg border px-2 py-1 text-xs opacity-70">⠿</span>
      </div>

      <div className="col-span-3">
        <input
          defaultValue={category.name}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== category.name) onEdit(category.id, { name: v });
          }}
          disabled={category.isSystem}
        />
      </div>

      <div className="col-span-3">
        <input
          defaultValue={category.slug}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== category.slug) onEdit(category.id, { slug: v });
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
          className="rounded-lg border px-2 py-1 text-xs transition-colors hover:bg-accent disabled:opacity-50"
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