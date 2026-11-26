"use client";

import SmartImage from "@/components/shared/SmartImage";
import { ModalPortal } from "@/components/shared/ModalPortal";
import { Button } from "@/components/shared/Button";
import MediaDetailsSections from "./MediaDetailsSections";
import type { MediaItem, TagLinks } from "./types";
import { toEmbedUrl } from "@/lib/video-embed";
import { EmbedPlayer } from "./EmbedPlayer";
import { POPUP_IMAGE_SIZES } from "@/lib/client/preload-popup-image";
import { useCardExpand } from "@/components/shared/expand/useCardExpand";
import { cardTriggerOf } from "@/lib/client/expand-origin";
import { PopupStepButtons } from "@/components/shared/popup-sequence/PopupStepButtons";
import { usePopupStepper } from "@/components/shared/popup-sequence/usePopupStepper";
import type { PopupNav } from "@/components/shared/popup-sequence/usePopupSequence";

function MediaSurface({ active }: { active: MediaItem }) {
  if (active.type === "embed" && active.embedUrl) {
    const src = toEmbedUrl(active.embedUrl) ?? active.embedUrl;

    return (
      <div data-expand-target className="h-full w-full overflow-hidden rounded-2xl border bg-black">
        <EmbedPlayer key={active.id} src={src} title={active.title} posterUrl={active.posterUrl} />
      </div>
    );
  }

  if (active.type === "video" && active.secureUrl) {
    return (
      <div data-expand-target className="h-full w-full overflow-hidden rounded-2xl border bg-black">
        <video
          key={active.id}
          className="h-full w-full object-contain"
          controls
          preload="metadata"
          playsInline
          src={active.secureUrl}
        />
      </div>
    );
  }

  if (active.secureUrl) {
    return (
      <div data-expand-target className="h-full w-full overflow-hidden rounded-2xl border bg-black/5">
        <div className="relative h-full min-h-0">
          <div className="relative h-full w-full">
            <SmartImage
              src={active.secureUrl}
              alt={active.title}
              fill
              className="object-contain"
              sizes={POPUP_IMAGE_SIZES}
              preload
            />
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No media</div>;
}

export default function MediaLightbox({
  active,
  onClose,
  tagLinks,
  nav = null,
}: {
  active: MediaItem;
  onClose: () => void;
  tagLinks?: TagLinks;
  /** Previous / next through the list the popup was opened from. */
  nav?: PopupNav | null;
}) {
  const { panelRef, requestClose, retarget } = useCardExpand<HTMLDivElement>(onClose);
  const { areaRef, surfaceRef, step } = usePopupStepper({ itemId: active.id, nav, retarget });

  return (
    <ModalPortal
      onClose={requestClose}
      label={active.title || "Media detail"}
      returnFocusTo={() => cardTriggerOf(active.id)}
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4"
    >
      <div
        ref={panelRef}
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b bg-background/80 p-4 backdrop-blur">
          <div className="min-w-0 text-lg font-semibold wrap-anywhere" aria-live="polite" aria-atomic="true">
            {active.title}
          </div>
          <Button data-autofocus onClick={requestClose}>
            Close
          </Button>
        </div>

        <div className="grid h-[82vh] min-h-0 grid-rows-[45vh_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[1.25fr_0.75fr]">
          <div
            ref={areaRef}
            data-popup-swipe
            className="relative min-h-0 touch-pan-y touch-pinch-zoom overflow-hidden bg-black/5 p-4"
          >
            <div ref={surfaceRef} className="h-full w-full">
              <MediaSurface active={active} />
            </div>
            {nav ? <PopupStepButtons nav={nav} onStep={step} /> : null}
          </div>

          <div className="min-h-0 overflow-y-auto p-5" data-lenis-prevent>
            <MediaDetailsSections active={active} tagLinks={tagLinks} />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}