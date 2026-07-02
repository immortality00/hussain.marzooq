"use client";

import type { ReactNode } from "react";
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
import type { TextCard } from "@/lib/page-sections-shared";

function SortableRow({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.85 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 rounded-2xl border p-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="h-fit shrink-0 cursor-grab rounded-xl border px-2 py-1 text-xs opacity-80 hover:opacity-100"
        aria-label="Drag"
        title="Drag"
      >
        ⠿
      </button>

      <div className="min-w-0 flex-1 space-y-2">{children}</div>

      <button
        type="button"
        onClick={onRemove}
        className="h-fit shrink-0 rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-red-500/10"
      >
        Remove
      </button>
    </div>
  );
}

export function RepeatingListEditor<T>({
  items,
  onChange,
  makeNew,
  renderFields,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  renderFields: (item: T, onItemChange: (item: T) => void) => ReactNode;
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
          {items.map((item, i) => (
            <SortableRow key={ids[i]} id={ids[i]} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
              {renderFields(item, (next) => onChange(items.map((c, idx) => (idx === i ? next : c))))}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => onChange([...items, makeNew()])}
        className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
      >
        + Add card
      </button>
    </div>
  );
}

export function RepeatingCardListEditor({
  items,
  onChange,
}: {
  items: TextCard[];
  onChange: (items: TextCard[]) => void;
}) {
  return (
    <RepeatingListEditor
      items={items}
      onChange={onChange}
      makeNew={() => ({ title: "", text: "" })}
      renderFields={(card, onItemChange) => (
        <>
          <input
            type="text"
            value={card.title}
            onChange={(e) => onItemChange({ ...card, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <textarea
            rows={2}
            value={card.text}
            onChange={(e) => onItemChange({ ...card, text: e.target.value })}
            placeholder="Text"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </>
      )}
    />
  );
}
