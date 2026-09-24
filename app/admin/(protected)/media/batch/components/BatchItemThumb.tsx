"use client";

import Image from "next/image";
import { batchItemLabel, type BatchItem } from "../lib/useBatchMediaState";

export function BatchItemThumb({
  item,
  onRemove,
  compact = false,
}: {
  item: BatchItem;
  onRemove?: () => void;
  compact?: boolean;
}) {
  const label = batchItemLabel(item);
  const still = item.kind === "file" ? item.secureUrl : item.preview;

  return (
    <div
      className={
        compact
          ? "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-muted"
          : "relative overflow-hidden rounded-2xl border bg-muted"
      }
    >
      {item.kind === "file" && item.resourceType === "video" ? (
        <video
          className={compact ? "h-full w-full object-cover" : "aspect-video w-full object-cover"}
          preload="metadata"
          src={item.secureUrl}
        />
      ) : (
        <div className={compact ? "relative h-full w-full" : "relative aspect-video"}>
          {still ? (
            <Image
              src={still}
              alt={label}
              fill
              className="object-cover"
              sizes={compact ? "112px" : "(max-width: 1024px) 100vw, 320px"}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              ▶
            </div>
          )}
        </div>
      )}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 rounded-full bg-background/80 px-2 py-0.5 text-xs backdrop-blur hover:bg-background"
        >
          Remove
        </button>
      ) : null}

      {!compact ? (
        <div className="truncate px-2 py-1 text-[11px] text-muted-foreground">{label}</div>
      ) : null}
    </div>
  );
}
