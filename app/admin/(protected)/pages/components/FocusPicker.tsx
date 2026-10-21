"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clampFocus, type HeroFocus } from "@/lib/hero-focus";

const MAX_HEIGHT = "min(50vh, 520px)";
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

// The whole photo with a marker on the part that must stay in view. Click or
// drag anywhere on the photo to move it; the arrow keys nudge it (Shift: 5%).
export function FocusPicker({
  url,
  focus,
  onChange,
}: {
  url: string;
  focus: HeroFocus;
  onChange: (focus: HeroFocus) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  // Width / height of the photo; known once it loads.
  const [ratio, setRatio] = useState(2 / 3);

  function place(event: PointerEvent<HTMLDivElement>) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box?.width || !box.height) return;
    onChange(clampFocus(((event.clientX - box.left) / box.width) * 100, ((event.clientY - box.top) / box.height) * 100));
  }

  function nudge(event: KeyboardEvent<HTMLButtonElement>) {
    const move = ARROWS[event.key];
    if (!move) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    onChange(clampFocus(focus.x + move[0] * step, focus.y + move[1] * step));
  }

  return (
    <div
      ref={boxRef}
      className="relative mx-auto min-w-0 cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-muted md:mx-0"
      style={{ aspectRatio: ratio, width: `min(100%, calc(${MAX_HEIGHT} * ${ratio}))` }}
      onPointerDown={(event) => {
        // Keeps keyboard focus on the marker, so the arrow keys still nudge after a click.
        event.preventDefault();
        markerRef.current?.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        place(event);
      }}
      onPointerMove={(event) => {
        if (dragging.current) place(event);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="(max-width: 768px) 90vw, 520px"
        draggable={false}
        className="pointer-events-none object-cover"
        onLoad={(event) => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) setRatio(image.naturalWidth / image.naturalHeight);
        }}
      />
      <button
        ref={markerRef}
        type="button"
        aria-label={`Framing point, ${focus.x}% across and ${focus.y}% down`}
        onKeyDown={nudge}
        className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/25 shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
      />
    </div>
  );
}
