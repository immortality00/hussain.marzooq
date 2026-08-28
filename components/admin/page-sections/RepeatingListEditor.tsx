"use client";

import type { ReactNode } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList, useSortableRow } from "@/components/admin/sortable/SortableList";
import { EMPTY_SECTION_IMAGE, type TextCard } from "@/lib/page-sections-shared";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { adminButtonClasses } from "@/components/admin/AdminButton";

function SortableRow({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: ReactNode;
  onRemove: () => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(id);

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 rounded-2xl border p-3">
      <button
        type="button"
        {...handleProps}
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
        className={adminButtonClasses("danger", "md", "h-fit shrink-0")}
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
  addLabel = "+ Add card",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  renderFields: (item: T, onItemChange: (item: T) => void) => ReactNode;
  addLabel?: string;
}) {
  const ids = items.map((_, i) => String(i));

  function onReorder(activeId: string, overId: string) {
    onChange(arrayMove(items, Number(activeId), Number(overId)));
  }

  return (
    <div className="space-y-2">
      <SortableList ids={ids} onReorder={onReorder} className="space-y-2">
        {items.map((item, i) => (
          <SortableRow key={ids[i]} id={ids[i]} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
            {renderFields(item, (next) => onChange(items.map((c, idx) => (idx === i ? next : c))))}
          </SortableRow>
        ))}
      </SortableList>

      <button
        type="button"
        onClick={() => onChange([...items, makeNew()])}
        className={adminButtonClasses("default", "md")}
      >
        {addLabel}
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
      makeNew={() => ({ title: "", text: "", image: EMPTY_SECTION_IMAGE })}
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
          <ImageField
            label="Card image"
            value={card.image}
            onChange={(image) => onItemChange({ ...card, image })}
          />
        </>
      )}
    />
  );
}
