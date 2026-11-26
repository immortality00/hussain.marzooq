"use client";

import { useEffect, type RefObject } from "react";
import { containBox } from "@/lib/client/expand-origin";

/**
 * Where the artwork's own top-left corner is inside its frame: the popup shows it whole
 * (object-contain), so a tall piece leaves dark bars at its sides and a wide one above and
 * below. Written as --art-left / --art-top on the frame, so the status badge sits on the
 * artwork as it does on the card — not across its edge.
 */
export function useArtworkCorner(frameRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function measure() {
      const media = frame!.querySelector<HTMLImageElement | HTMLVideoElement>("img, video");
      const width = media instanceof HTMLVideoElement ? media.videoWidth : media?.naturalWidth;
      const height = media instanceof HTMLVideoElement ? media.videoHeight : media?.naturalHeight;
      const fit =
        width && height
          ? containBox({ left: 0, top: 0, width: frame!.clientWidth, height: frame!.clientHeight }, width / height)
          : { left: 0, top: 0 };
      frame!.style.setProperty("--art-left", `${fit.left}px`);
      frame!.style.setProperty("--art-top", `${fit.top}px`);
    }

    const resize = new ResizeObserver(measure);
    resize.observe(frame);
    frame.addEventListener("load", measure, true);
    frame.addEventListener("loadedmetadata", measure, true);
    return () => {
      resize.disconnect();
      frame.removeEventListener("load", measure, true);
      frame.removeEventListener("loadedmetadata", measure, true);
    };
  }, [frameRef]);
}
