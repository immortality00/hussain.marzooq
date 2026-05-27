"use client";

import Image from "next/image";
import type { MediaItem } from "./types";

function PlayBadge() {
  return (
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
      <span className="inline-block h-2 w-2 rounded-full bg-white" />
      Play
    </div>
  );
}

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
    return <div className="rounded-2xl border p-6 text-sm text-muted-foreground">No matches.</div>;
  }

  const cardAspect = mediaMode === "video" ? "aspect-video" : "aspect-4/3";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m, idx) => {
        const isEmbed = m.type === "embed" && !!m.embedUrl;
        const isVideo = m.type === "video" && !!m.secureUrl;
        const isImage = !isEmbed && !isVideo && !!m.secureUrl;
        const imagePriority = idx === 0;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className="group overflow-hidden rounded-2xl border bg-muted text-left"
          >
            <div className={`relative ${cardAspect}`}>
              {isImage ? (
                <Image
                  src={m.secureUrl ?? "/placeholder.png"}
                  alt={m.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={imagePriority ? "eager" : "lazy"}
                  fetchPriority={imagePriority ? "high" : undefined}
                />
              ) : isVideo ? (
                <div className="absolute inset-0 bg-black">
                  <video
                    src={m.secureUrl ?? undefined}
                    className="h-full w-full object-contain"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <PlayBadge />
                </div>
              ) : isEmbed ? (
                <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-950">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl backdrop-blur">
                      ▶
                    </div>
                    <div className="line-clamp-2 text-sm font-medium">{m.title}</div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-muted to-background" />
              )}

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