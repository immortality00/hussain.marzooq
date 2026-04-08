"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Service } from "../lib/types";

export default function SortableServiceItem({
  service,
  onEdit,
  onToggleActive,
  onDeleteForever,
}: {
  service: Service;
  onEdit: (s: Service) => void;
  onToggleActive: (s: Service) => void;
  onDeleteForever: (s: Service) => void;
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
      className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-accent/20 transition-colors"
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

      <div className="h-14 w-20 overflow-hidden rounded-xl border bg-muted">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            width={320}
            height={224}
            className="h-full w-full object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{service.name}</div>

          {!service.isActive ? (
            <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
              inactive
            </span>
          ) : (
            <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
              active
            </span>
          )}

          <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
            inquiries: {service.inquiriesCount}
          </span>
        </div>

        <div className="truncate text-xs text-muted-foreground">/{service.slug}</div>
        <div className="truncate text-xs text-muted-foreground">
          category: <span className="font-mono">{service.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleActive(service)}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
          title={service.isActive ? "Deactivate service" : "Activate service"}
        >
          {service.isActive ? "Deactivate" : "Activate"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteForever(service)}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10 transition-colors"
          title="Delete forever"
        >
          Delete
        </button>
      </div>
    </div>
  );
}