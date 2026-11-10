"use client";

import { useEffect, useState } from "react";
import { preconnect } from "react-dom";
import { Play } from "lucide-react";
import SmartImage from "@/components/shared/SmartImage";
import { autoplayEmbedSrc, embedOrigin } from "@/lib/video-embed";
import { POPUP_IMAGE_SIZES } from "@/lib/client/preload-popup-image";

const FRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/**
 * A YouTube/Vimeo video in a popup. With a stored poster it shows the poster and a
 * Play button at once, and the player loads only when Play is tapped, then starts
 * playing — the player's own page takes seconds to load and is black meanwhile.
 * Without a poster the player loads straight away, as before.
 */
export function EmbedPlayer({ src, title, posterUrl }: { src: string; title: string; posterUrl?: string | null }) {
  const [playing, setPlaying] = useState(!posterUrl);

  useEffect(() => {
    const origin = embedOrigin(src);
    if (origin) preconnect(origin);
  }, [src]);

  if (playing || !posterUrl) {
    return (
      <iframe
        className="h-full w-full"
        src={posterUrl ? autoplayEmbedSrc(src) : src}
        title={title}
        allow={FRAME_ALLOW}
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group relative block h-full w-full cursor-pointer"
    >
      <SmartImage src={posterUrl} alt="" fill className="object-contain" sizes={POPUP_IMAGE_SIZES} preload />
      <span className="hm-press hm-press-quick absolute top-1/2 left-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black group-hover:bg-white/85">
        <Play className="ml-1 size-7 fill-current" aria-hidden />
      </span>
    </button>
  );
}
