"use client";

import MediaCardGrid from "@/components/media/MediaCardGrid";
import { ModalPortal } from "@/components/shared/ModalPortal";
import type { MediaItem } from "@/components/media/types";
import type { ExhibitionCity } from "@/lib/server/public-media";

export function ExhibitionCityModal({
  city,
  onSelectItem,
  onClose,
}: {
  city: ExhibitionCity;
  onSelectItem: (item: MediaItem) => void;
  onClose: () => void;
}) {
  const place = [city.city, city.country].filter(Boolean).join(", ");

  return (
    <ModalPortal onClose={onClose} className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <div
        className="mx-auto flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b bg-background/80 p-4 backdrop-blur">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{place}</div>
            <div className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
              {city.works.length} exhibited {city.works.length === 1 ? "work" : "works"}
            </div>
          </div>
          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5" data-lenis-prevent>
          <MediaCardGrid items={city.works} onSelect={onSelectItem} />
        </div>
      </div>
    </ModalPortal>
  );
}
