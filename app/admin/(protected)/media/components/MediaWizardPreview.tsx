"use client";

import Image from "next/image";
import type { Uploaded } from "../lib/types";

export function MediaWizardPreview({
  mode,
  uploaded,
  embedUrl,
  posterUrl,
}: {
  mode: "upload" | "embed";
  uploaded: Uploaded | null;
  embedUrl: string;
  posterUrl: string | null;
}) {
  const hasAsset = mode === "upload" ? Boolean(uploaded) : Boolean(embedUrl.trim());
  if (!hasAsset) return null;

  const stillSrc = mode === "upload" ? (uploaded?.resourceType === "video" ? null : uploaded?.secureUrl) : posterUrl;

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border bg-muted">
      {mode === "upload" && uploaded?.resourceType === "video" ? (
        <video className="h-16 w-24 object-cover" src={uploaded.secureUrl} muted playsInline />
      ) : stillSrc ? (
        <div className="relative h-16 w-24">
          <Image src={stillSrc} alt="Media preview" fill className="object-cover" sizes="96px" />
        </div>
      ) : (
        <div className="flex h-16 w-24 items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
          Embed added
        </div>
      )}
    </div>
  );
}
