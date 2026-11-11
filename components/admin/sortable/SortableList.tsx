"use client";

import { useId, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import {
  SORTABLE_EASE_OUT,
  SORTABLE_SETTLE_KEYFRAMES,
  SORTABLE_SETTLE_TIMING,
  SORTABLE_SLIDE_MS,
  sortableRowStyle,
} from "@/lib/sortable-row-style";

const SLIDE = { duration: SORTABLE_SLIDE_MS, easing: SORTABLE_EASE_OUT };
const HANDLE_STYLE: CSSProperties = { touchAction: "none" };

export function SortableList({
  ids,
  onReorder,
  children,
  className,
}: {
  ids: string[];
  onReorder: (activeId: string, overId: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}

export function useSortableRow(id: string) {
  const reduceMotion = useMotionPreference() === "reduce";
  const { attributes, listeners, setNodeRef, node, transform, transition, isDragging } = useSortable({
    id,
    transition: reduceMotion ? null : SLIDE,
  });
  const style = sortableRowStyle({
    transform: CSS.Transform.toString(transform),
    transition,
    isDragging,
    reduceMotion,
  });
  const wasDragging = useRef(false);
  useLayoutEffect(() => {
    const dropped = wasDragging.current && !isDragging;
    wasDragging.current = isDragging;
    if (dropped && !reduceMotion) node.current?.animate?.(SORTABLE_SETTLE_KEYFRAMES, SORTABLE_SETTLE_TIMING);
  }, [isDragging, reduceMotion, node]);
  // Without touch-action: none a drag that starts on the handle scrolls the page on a phone.
  return { setNodeRef, style, handleProps: { ...attributes, ...listeners, style: HANDLE_STYLE }, isDragging };
}
