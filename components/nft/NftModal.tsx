"use client";

import { useRef } from "react";
import SmartImage from "@/components/shared/SmartImage";
import Link from "next/link";
import { ModalPortal } from "@/components/shared/ModalPortal";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import type { TagLinks } from "@/components/media/types";
import { buildInquiryHref, displayStatus, editionLabel } from "./lib";
import { NftDetails } from "./NftDetails";
import { NftStatusBadge } from "./NftStatusBadge";
import { useArtworkCorner } from "./useArtworkCorner";
import { Button, buttonClasses } from "@/components/shared/Button";
import { NFT_POPUP_IMAGE_SIZES } from "@/lib/client/preload-popup-image";
import { useCardExpand } from "@/components/shared/expand/useCardExpand";
import { cardTriggerOf } from "@/lib/client/expand-origin";
import { PopupStepButtons } from "@/components/shared/popup-sequence/PopupStepButtons";
import { usePopupStepper } from "@/components/shared/popup-sequence/usePopupStepper";
import type { PopupNav } from "@/components/shared/popup-sequence/usePopupSequence";

function NftMedia({ item }: { item: PublicNftItem }) {
  if (!item.mediaUrl) {
    return <div className="flex h-full items-center justify-center text-sm text-white/70">No media</div>;
  }
  if (item.mediaType === "video") {
    return (
      <video
        key={item.id}
        className="h-full w-full object-contain"
        controls
        preload="metadata"
        playsInline
        src={item.mediaUrl}
      />
    );
  }
  return (
    <div className="relative h-full w-full">
      <SmartImage
        src={item.mediaUrl}
        alt={item.title}
        fill
        className="object-contain"
        sizes={NFT_POPUP_IMAGE_SIZES}
        preload
      />
    </div>
  );
}

export default function NftModal({
  item,
  onClose,
  tagLinks,
  nav = null,
}: {
  item: PublicNftItem;
  onClose: () => void;
  tagLinks?: TagLinks;
  /** Previous / next through the collection as filtered. */
  nav?: PopupNav | null;
}) {
  const inquiryHref = buildInquiryHref(item);
  const shownStatus = displayStatus(item);
  const { panelRef, requestClose, retarget } = useCardExpand<HTMLDivElement>(onClose);
  const { areaRef, surfaceRef, step } = usePopupStepper({ itemId: item.id, nav, retarget });
  const frameRef = useRef<HTMLDivElement>(null);
  useArtworkCorner(frameRef);

  return (
    <ModalPortal
      onClose={requestClose}
      label={item.title || "NFT detail"}
      returnFocusTo={() => cardTriggerOf(item.id)}
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4"
    >
      <div
        ref={panelRef}
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="min-w-0" aria-live="polite" aria-atomic="true">
            <div className="text-lg font-semibold wrap-anywhere">{item.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{editionLabel(item)}</div>
          </div>

          <Button data-autofocus onClick={requestClose}>
            Close
          </Button>
        </div>

        <div className="grid h-[82vh] min-h-0 grid-rows-[45vh_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[1.1fr_0.9fr]">
          <div
            ref={areaRef}
            data-popup-swipe
            className="relative min-h-0 touch-pan-y touch-pinch-zoom overflow-hidden bg-black/5 p-4"
          >
            <div ref={surfaceRef} className="h-full w-full">
              <div
                ref={frameRef}
                data-expand-target
                className="relative h-full w-full overflow-hidden rounded-[2rem] border bg-black"
              >
                <NftMedia item={item} />
                <div className="absolute top-[calc(var(--art-top,0px)_+_1rem)] left-[calc(var(--art-left,0px)_+_1rem)]">
                  <NftStatusBadge status={shownStatus} withSold />
                </div>
              </div>
            </div>
            {nav ? <PopupStepButtons nav={nav} onStep={step} /> : null}
          </div>

          <div className="min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5" data-lenis-prevent>
                <NftDetails item={item} tagLinks={tagLinks} />
              </div>

              <div className="border-t bg-background p-4">
                {item.nft.marketplaceUrl && shownStatus !== "sold" ? (
                  <a
                    href={item.nft.marketplaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClasses("solid", "w-full justify-center")}
                  >
                    Buy
                  </a>
                ) : (
                  <Link href={inquiryHref} className={buttonClasses("solid", "w-full justify-center")}>
                    Inquire
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
