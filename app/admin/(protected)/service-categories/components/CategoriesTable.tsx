"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Category, CategoryPatch } from "../lib/types";
import CategoryRowSortable from "./CategoryRowSortable";
import CategoryRowStatic from "./CategoryRowStatic";

export default function CategoriesTable({
  mounted,
  ordered,
  onDragEnd,
  onEdit,
  onToggle,
  onDelete,
}: {
  mounted: boolean;
  ordered: Category[];
  onDragEnd: (e: DragEndEvent) => void;
  onEdit: (id: string, patch: CategoryPatch) => void;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (cat: Category) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
        <div className="col-span-1"> </div>
        <div className="col-span-3">Name</div>
        <div className="col-span-3">Slug</div>
        <div className="col-span-2">Active</div>
        <div className="col-span-1">Order</div>
        <div className="col-span-1">Svcs</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {!mounted ? (
        ordered.map((c) => (
          <CategoryRowStatic
            key={c.id}
            category={c}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ordered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {ordered.map((c) => (
              <CategoryRowSortable
                key={c.id}
                category={c}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}