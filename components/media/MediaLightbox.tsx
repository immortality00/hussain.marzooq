"use client";

import SmartImage from "@/components/shared/SmartImage";
import MediaDetailsSections from "./MediaDetailsSections";
import type { MediaItem, TagLink } from "./types";
import { toEmbedUrl } from "./utils";

function MediaSurface({ active }: { active: MediaItem }) {
  if (active.type === "embed" && active.embedUrl) {
    const src = toEmbedUrl(active.embedUrl) ?? active.embedUrl;

    return (
      <div className="h-full w-full overflow-hidden rounded-2xl border bg-black">
        <iframe
          className="h-full w-full"
          src={src}
          title={active.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (active.type === "video" && active.secureUrl) {
    return (
      <div className="h-full w-full overflow-hidden rounded-2xl border bg-black">
        <video
          className="h-full w-full object-contain"
          controls
          preload="metadata"
          playsInline
          src={active.secureUrl}
        />
      </div>
    );
  }

  if (active.secureUrl) {
    return (
      <div className="h-full w-full overflow-hidden rounded-2xl border bg-black/5">
        <div className="relative h-full min-h-0">
          <div className="relative h-full w-full">
            <SmartImage
              src={active.secureUrl}
              alt={active.title}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 62vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No media</div>;
}

export default function MediaLightbox({
  active,
  onClose,
  tagLinks,
}: {
  active: MediaItem;
  onClose: () => void;
  tagLinks?: Record<string, TagLink>;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b bg-background/80 p-4 backdrop-blur">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{active.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {[active.year ? String(active.year) : "", active.location ?? "", active.event ?? ""]
                .filter(Boolean)
                .join(" • ")}
            </div>
          </div>
          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid h-[82vh] min-h-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="min-h-0 bg-black/5 p-4">
            <MediaSurface active={active} />
          </div>

          <div className="min-h-0 overflow-y-auto p-5" data-lenis-prevent>
            <MediaDetailsSections active={active} tagLinks={tagLinks} />
          </div>
        </div>
      </div>
    </div>
  );
}