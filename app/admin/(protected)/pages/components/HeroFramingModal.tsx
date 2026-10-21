"use client";

import { useState } from "react";
import { ModalPortal } from "@/components/shared/ModalPortal";
import { AdminButton } from "@/components/admin/AdminButton";
import { CENTRE_FOCUS, type HeroFocus } from "@/lib/hero-focus";
import { heroPreviewShapes } from "@/lib/hero-preview";
import { FocusPicker } from "./FocusPicker";
import { FramingPreview } from "./FramingPreview";

// Choose the part of a hero photo that stays in view: the photo with its marker,
// and the hero's shapes (open, at rest, phone) for the current number of photos.
export function HeroFramingModal({
  url,
  focus,
  count,
  onCancel,
  onDone,
}: {
  url: string;
  focus: HeroFocus;
  count: number;
  onCancel: () => void;
  onDone: (focus: HeroFocus) => void;
}) {
  const [draft, setDraft] = useState<HeroFocus>(focus);

  return (
    <ModalPortal
      onClose={onCancel}
      label="Frame hero photo"
      className="fixed inset-0 z-[70] flex overflow-y-auto bg-black/70 p-4"
    >
      <div
        className="m-auto w-full max-w-4xl rounded-[2rem] border bg-background p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-sm font-medium">Frame photo</div>

        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start md:justify-center md:gap-8">
          <FocusPicker url={url} focus={draft} onChange={setDraft} />
          <div className="flex items-end justify-center gap-3">
            {heroPreviewShapes(count).map((shape) => (
              <FramingPreview key={shape.key} url={url} focus={draft} shape={shape} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <AdminButton type="button" onClick={() => setDraft(CENTRE_FOCUS)}>
            Centre
          </AdminButton>
          <AdminButton type="button" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton type="button" variant="solid" onClick={() => onDone(draft)}>
            Done
          </AdminButton>
        </div>
      </div>
    </ModalPortal>
  );
}
