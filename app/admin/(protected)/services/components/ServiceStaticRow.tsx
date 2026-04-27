"use client";

import type { Service } from "../lib/types";

export default function ServiceStaticRow({
  service,
  onEdit,
  onArchive,
}: {
  service: Service;
  onEdit: (s: Service) => void;
  onArchive: (s: Service) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border p-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{service.name}</div>
        <div className="text-xs text-muted-foreground truncate">/{service.slug}</div>
      </div>
      <div className="flex gap-2">
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40" onClick={() => onEdit(service)}>
          Edit
        </button>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10" onClick={() => onArchive(service)}>
          Delete
        </button>
      </div>
    </div>
  );
}