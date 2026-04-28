"use client";

import Image from "next/image";
import type { MediaItem } from "./types";

export default function MediaCardGrid({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) {
  if (items.length === 0) {
    return <div className="rounded-2xl border p-6 text-sm text-muted-foreground">No matches.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m, idx) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m)}
          className="group overflow-hidden rounded-2xl border bg-muted text-left"
        >
          <div className="relative aspect-4/3">
            <Image
              src={m.secureUrl ?? "/placeholder.png"}
              alt={m.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={idx < 3}
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          </div>

          <div className="p-4">
            <div className="text-sm font-medium line-clamp-1">{m.title}</div>
            <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {[m.year ? String(m.year) : "", m.location ?? "", m.event ?? ""].filter(Boolean).join(" • ")}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}