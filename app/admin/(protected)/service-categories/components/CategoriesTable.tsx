"use client";

import { SortableList } from "@/components/admin/sortable/SortableList";
import type { Category, CategoryPatch } from "../lib/types";
import CategoryRow from "./CategoryRow";

export default function CategoriesTable({
  ordered,
  isSelected,
  onToggleSelect,
  onReorder,
  onEdit,
  onToggle,
  onDelete,
}: {
  ordered: Category[];
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onEdit: (id: string, patch: CategoryPatch) => Promise<boolean>;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
      <div className="min-w-[640px]">
      <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
        <div className="col-span-1"> </div>
        <div className="col-span-3">Name</div>
        <div className="col-span-3">Slug</div>
        <div className="col-span-2">Active</div>
        <div className="col-span-1">Order</div>
        <div className="col-span-1">Svcs</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <SortableList ids={ordered.map((c) => c.id)} onReorder={onReorder}>
        {ordered.map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            selected={isSelected(c.id)}
            onToggleSelect={() => onToggleSelect(c.id)}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </SortableList>
      </div>
      </div>
    </div>
  );
}
