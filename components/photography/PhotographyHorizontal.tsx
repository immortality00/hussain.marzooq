"use client";

import { useEffect, useRef } from "react";
import SmartMediaPreview from "@/components/media/SmartMediaPreview";
import type { MediaItem } from "@/components/media/types";
import { NoResults } from "@/components/shared/NoResults";

// Editorial, non-uniform heights (vh). Cycled across the track.
const HEIGHTS = [56, 46, 60, 50, 54];
const AUTO_SPEED = 0.5; // px per frame
const KEY_SPEED = 5; // px per frame while an arrow key is held
const RESUME_MS = 1500;

export default function PhotographyHorizontal({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    // The strip is centred by the flex container. Translation ping-pongs
    // AROUND that centre: 0 = centred, +max shows the left end, -max the right
    // end. So search results (few) sit centred, and the full set slides both
    // ways to reveal everything — no duplication, no empty gaps.
    const getMax = () => {
      const last = track.lastElementChild as HTMLElement | null;
      if (!last) return 0;
      const trailing = parseFloat(getComputedStyle(track).paddingRight) || 0;
      const contentWidth = last.offsetLeft + last.offsetWidth + trailing;
      return Math.max(0, (contentWidth - window.innerWidth) / 2);
    };

    let maxT = getMax();
    const remeasure = () => {
      maxT = getMax();
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(track);

    let x = 0; // centred
    let dir = -1;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let dragDist = 0;
    let keyDir = 0;
    let lastInteract = performance.now() - RESUME_MS;

    const clamp = (v: number) => Math.max(-maxT, Math.min(maxT, v));

    function onDown(e: PointerEvent) {
      dragging = true;
      dragDist = 0;
      draggedRef.current = false;
      lastX = e.clientX;
      velocity = 0;
      lastInteract = performance.now();
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragDist += Math.abs(dx);
      if (dragDist > 6) draggedRef.current = true;
      x = clamp(x + dx);
      velocity = dx;
      lastInteract = performance.now();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      lastInteract = performance.now();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") keyDir = 1;
      else if (e.key === "ArrowRight") keyDir = -1;
      else return;
      velocity = 0;
    }
    function onKeyUp(e: KeyboardEvent) {
      if ((e.key === "ArrowLeft" && keyDir === 1) || (e.key === "ArrowRight" && keyDir === -1)) {
        keyDir = 0;
        lastInteract = performance.now();
      }
    }

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let raf: number;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (maxT > 0 && !dragging) {
        if (keyDir !== 0) {
          x = clamp(x + keyDir * KEY_SPEED);
          lastInteract = performance.now();
        } else if (Math.abs(velocity) > 0.1) {
          x = clamp(x + velocity);
          velocity *= 0.92;
        } else if (performance.now() - lastInteract > RESUME_MS) {
          x += dir * AUTO_SPEED;
          if (x <= -maxT) {
            x = -maxT;
            dir = 1;
          } else if (x >= maxT) {
            x = maxT;
            dir = -1;
          }
        }
      }
      track!.style.transform = `translate3d(${maxT > 0 ? x : 0}px,0,0)`;
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [items]);

  if (items.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="relative ml-[calc(50%-50vw)] flex h-[calc(100vh-20rem)] min-h-[360px] w-screen items-center justify-center overflow-hidden">
      <div
        ref={trackRef}
        className="flex h-full w-max cursor-grab touch-pan-y items-center gap-8 px-[6vw] select-none will-change-transform active:cursor-grabbing"
      >
        {items.map((m, idx) => {
          const height = HEIGHTS[idx % HEIGHTS.length];
          const isVideo = m.type === "video" && !!m.secureUrl;
          const isEmbed = m.type === "embed" && !!m.embedUrl;
          const isImage = !isEmbed && !isVideo && !!m.secureUrl;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (draggedRef.current) return;
                onSelect(m);
              }}
              style={{ height: `${height}vh` }}
              className="group relative aspect-3/4 shrink-0 overflow-hidden rounded-2xl border bg-muted text-left"
            >
              <SmartMediaPreview
                mode={isImage ? "image" : isVideo ? "video" : isEmbed ? "embed" : "empty"}
                src={m.secureUrl}
                embedUrl={m.embedUrl}
                title={m.title}
                fit="cover"
                sizes="50vh"
                imageClassName="pointer-events-none object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                showPlayBadge={isVideo}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="line-clamp-1 text-sm font-medium text-white">{m.title}</div>
                <div className="mt-0.5 line-clamp-1 text-xs text-white/70">
                  {[m.year ? String(m.year) : "", m.location ?? "", m.event ?? ""]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
