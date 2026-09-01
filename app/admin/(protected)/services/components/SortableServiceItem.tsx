"use client";

import SmartImage from "@/components/shared/SmartImage";
import { useSortableRow } from "@/components/admin/sortable/SortableList";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { Service } from "../lib/types";

export default function SortableServiceItem({
  service,
  index,
  selected,
  onToggleSelect,
  onEdit,
  onToggleActive,
  onDeleteForever,
}: {
  service: Service;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: (s: Service) => void;
  onToggleActive: (s: Service) => void;
  onDeleteForever: (s: Service) => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(service.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition-colors hover:bg-accent/20"
    >
      <BulkCheckbox checked={selected} onChange={onToggleSelect} label={`Select ${service.name}`} />
      <button
        type="button"
        {...handleProps}
        className="cursor-grab rounded-xl border px-2 py-1 text-xs opacity-80 hover:opacity-100"
        aria-label="Drag"
        title="Drag"
      >
        ⠿
      </button>

      <div className="h-14 w-20 overflow-hidden rounded-xl border bg-muted">
        {service.imageUrl ? (
          <SmartImage
            src={service.imageUrl}
            alt={service.name}
            width={320}
            height={224}
            className="h-full w-full object-cover"
            sizes="80px"
            priority={index === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="w-full truncate font-medium sm:w-auto">{service.name}</div>

          {!service.isActive ? (
            <span className="shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
              inactive
            </span>
          ) : (
            <span className="shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
              active
            </span>
          )}

          <span className="shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
            inquiries: {service.inquiriesCount}
          </span>
        </div>

        <div className="truncate text-xs text-muted-foreground">/{service.slug}</div>
        <div className="truncate text-xs text-muted-foreground">
          category: <span className="font-mono">{service.category}</span>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className={adminButtonClasses("default", "md")}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleActive(service)}
          className={adminButtonClasses("default", "md")}
          title={service.isActive ? "Deactivate service" : "Activate service"}
        >
          {service.isActive ? "Deactivate" : "Activate"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteForever(service)}
          className={adminButtonClasses("danger", "md")}
          title="Delete forever"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
