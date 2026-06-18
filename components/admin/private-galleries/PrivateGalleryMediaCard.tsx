"use client";

import Image from "next/image";
import type { MediaItem } from "./types";
import { mediaMetaText } from "./media-picker-utils";

type PrivateGalleryMediaCardProps = {
  item: MediaItem;
  selected: boolean;
  onToggle: (id: string) => void;
};

export function PrivateGalleryMediaCard({
  item,
  selected,
  onToggle,
}: PrivateGalleryMediaCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={`overflow-hidden rounded-[1.5rem] border text-left transition-colors ${
        selected ? "border-foreground bg-accent/30" : "hover:bg-accent/20"
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {item.secureUrl ? (
          item.type === "video" ? (
            <video className="h-full w-full object-cover" src={item.secureUrl} muted playsInline />
          ) : (
            <Image
              src={item.secureUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="240px"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No preview
          </div>
        )}

        {selected ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-sm">
            Selected
          </span>
        ) : null}
      </div>

      <div className="space-y-1 p-3">
        <div className="line-clamp-1 text-sm font-medium">{item.title}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">{mediaMetaText(item)}</div>
      </div>
    </button>
  );
}