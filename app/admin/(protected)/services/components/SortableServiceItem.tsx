"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Service } from "../lib/types";

export default function SortableServiceItem({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: (s: Service) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-white/5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-xl border px-2 py-1 text-xs opacity-80 hover:opacity-100"
        aria-label="Drag"
        title="Drag"
      >
        ⠿
      </button>

      <div className="h-14 w-20 overflow-hidden rounded-xl border bg-white/5">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            width={320}
            height={224}
            className="h-full w-full object-cover"
            sizes="80px"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{service.name}</div>
          {!service.isActive ? (
            <span className="rounded-full border px-2 py-0.5 text-[10px] opacity-70">inactive</span>
          ) : null}
          <span className="rounded-full border px-2 py-0.5 text-[10px] opacity-70">
            inquiries: {service.inquiriesCount}
          </span>
        </div>
        <div className="truncate text-xs opacity-70">/{service.slug}</div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(service)}
        className="rounded-xl border px-3 py-2 text-sm hover:bg-white/5"
      >
        Edit
      </button>
    </div>
  );
}