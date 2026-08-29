"use client";

import SmartMediaPreview from "./SmartMediaPreview";
import { NoResults } from "@/components/shared/NoResults";
import type { MediaItem } from "./types";

const EAGER_GRID_IMAGE_COUNT = 3;

export default function MediaCardGrid({
  items,
  onSelect,
  mediaMode = "image",
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  mediaMode?: "image" | "video";
}) {
  if (items.length === 0) {
    return <NoResults />;
  }

  const cardAspect = mediaMode === "video" ? "aspect-video" : "aspect-4/3";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m, idx) => {
        const isEmbed = m.type === "embed" && !!m.embedUrl;
        const isVideo = m.type === "video" && !!m.secureUrl;
        const isImage = !isEmbed && !isVideo && !!m.secureUrl;
        const imagePriority = idx < EAGER_GRID_IMAGE_COUNT;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className="group overflow-hidden rounded-2xl border bg-muted text-left"
          >
            <div className={`relative ${cardAspect}`}>
              <SmartMediaPreview
                mode={isImage ? "image" : isVideo ? "video" : isEmbed ? "embed" : "empty"}
                src={m.secureUrl}
                embedUrl={m.embedUrl}
                title={m.title}
                fit={isVideo ? "contain" : "cover"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                imagePriority={imagePriority}
                imageClassName="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                showPlayBadge={isVideo}
              />

              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
              </div>
            </div>

            <div className="p-4">
              <div className="line-clamp-1 text-sm font-medium">{m.title}</div>
              <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {[m.year ? String(m.year) : "", m.location ?? "", m.event ?? ""]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
