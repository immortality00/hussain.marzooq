"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableStringRow({
  id,
  value,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.85 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 rounded-2xl border p-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab rounded-xl border px-2 py-1 text-xs opacity-80 hover:opacity-100"
        aria-label="Drag"
        title="Drag"
      >
        ⠿
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-red-500/10"
      >
        Remove
      </button>
    </div>
  );
}

export function RepeatingStringListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = items.map((_, i) => String(i));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onChange(arrayMove(items, Number(active.id), Number(over.id)));
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((value, i) => (
            <SortableStringRow
              key={ids[i]}
              id={ids[i]}
              value={value}
              onChange={(next) => onChange(items.map((v, idx) => (idx === i ? next : v)))}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
      >
        + Add item
      </button>
    </div>
  );
}
