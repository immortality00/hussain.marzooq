"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ModalPortal } from "@/components/shared/ModalPortal";
import { AdminButton } from "@/components/admin/AdminButton";

const FRAME_SIZE = 256;
const OUTPUT_SIZE = 640;
const MAX_ZOOM = 4;

type Offset = { x: number; y: number };
type Natural = { w: number; h: number };

function scaleFor(natural: Natural, zoom: number) {
  return (FRAME_SIZE / Math.min(natural.w, natural.h)) * zoom;
}

function clampOffset(next: Offset, natural: Natural, zoom: number): Offset {
  const scale = scaleFor(natural, zoom);
  const maxX = Math.max(0, (natural.w * scale - FRAME_SIZE) / 2);
  const maxY = Math.max(0, (natural.h * scale - FRAME_SIZE) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, next.x)),
    y: Math.min(maxY, Math.max(-maxY, next.y)),
  };
}

export function AvatarCropModal({
  imageUrl,
  onCancel,
  onConfirm,
}: {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<Natural | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origin: Offset } | null>(null);

  function setZoomClamped(value: number) {
    const nextZoom = Math.min(MAX_ZOOM, Math.max(1, value));
    setZoom(nextZoom);
    setOffset((prev) => (natural ? clampOffset(prev, natural, nextZoom) : prev));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!natural) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, origin: offset };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || !natural) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(
        { x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy },
        natural,
        zoom,
      ),
    );
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function confirm() {
    if (!natural || !imgRef.current) return;
    const scale = scaleFor(natural, zoom);
    const left = FRAME_SIZE / 2 - (natural.w * scale) / 2 + offset.x;
    const top = FRAME_SIZE / 2 - (natural.h * scale) / 2 + offset.y;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      (0 - left) / scale,
      (0 - top) / scale,
      FRAME_SIZE / scale,
      FRAME_SIZE / scale,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    canvas.toBlob((blob) => blob && onConfirm(blob), "image/jpeg", 0.92);
  }

  const scale = natural ? scaleFor(natural, zoom) : 1;

  return (
    <ModalPortal
      onClose={onCancel}
      label="Crop avatar"
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 p-4"
    >
      <div
        className="w-full max-w-sm rounded-[2rem] border bg-background p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-sm font-medium">Crop avatar</div>
        <p className="mt-1 text-xs text-muted-foreground">Drag to reposition, use the slider to zoom.</p>

        <div
          className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-full border bg-muted"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pan/zoom crop source, drawn to canvas, not a Cloudinary asset */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            draggable={false}
            onLoad={(event) => {
              const el = event.currentTarget;
              setNatural({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={
              natural
                ? {
                    width: natural.w * scale,
                    height: natural.h * scale,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  }
                : { opacity: 0 }
            }
          />
        </div>

        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoomClamped(Number(event.target.value))}
          disabled={!natural}
          className="mt-4 w-full"
          aria-label="Zoom"
        />

        <div className="mt-5 flex justify-end gap-2">
          <AdminButton type="button" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton type="button" variant="solid" onClick={confirm} disabled={!natural}>
            Use photo
          </AdminButton>
        </div>
      </div>
    </ModalPortal>
  );
}
