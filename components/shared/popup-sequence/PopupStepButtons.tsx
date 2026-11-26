"use client";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { StepDirection } from "@/lib/popup-sequence";
import type { PopupNav } from "./usePopupSequence";

/**
 * A 44 px circle on the photo's edge, in the dark glass of the NFT card's badge, so it reads
 * on any picture in both themes. Greyed at the ends but still focusable.
 */
const STEP_BUTTON =
  "hm-press absolute top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-[6px] hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground aria-disabled:pointer-events-none aria-disabled:opacity-30";

function StepButton({
  label,
  icon: Icon,
  side,
  enabled,
  busy = false,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  side: string;
  enabled: boolean;
  busy?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={enabled ? undefined : true}
      aria-busy={busy || undefined}
      onClick={() => {
        if (enabled && !busy) onPress();
      }}
      className={`${STEP_BUTTON} ${side}`}
    >
      {busy ? <span className="hm-spinner [--hm-spinner-size:1rem]" aria-hidden /> : <Icon className="size-5" aria-hidden />}
    </button>
  );
}

/**
 * Previous and Next on the left and right of a popup's photo (inside its media area, which is
 * `relative`). Next turns into a spinner while the next page loads. Nothing is drawn when the
 * list holds this item alone.
 */
export function PopupStepButtons({ nav, onStep }: { nav: PopupNav; onStep: (direction: StepDirection) => void }) {
  if (!nav.hasPrevious && !nav.hasNext) return null;
  return (
    <>
      <StepButton label="Previous" icon={ChevronLeft} side="left-6" enabled={nav.hasPrevious} onPress={() => onStep(-1)} />
      <StepButton
        label="Next"
        icon={ChevronRight}
        side="right-6"
        enabled={nav.hasNext}
        busy={nav.waiting}
        onPress={() => onStep(1)}
      />
    </>
  );
}
