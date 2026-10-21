"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import SmartImage from "@/components/shared/SmartImage";
import type { SectionImage } from "@/lib/page-sections-shared";
import { HERO_PHONE_MAX_PHOTOS, heroLayout, heroPhotoSizes } from "@/lib/hero-photos";
import { usePreloaderMediaLoaded } from "./usePreloaderMediaLoaded";

// How long a tapped strip stays open, with the words dimmed, on a touch screen.
const TAP_OPEN_MS = 3000;

// The hero's photo strips, equal at rest. A mouse opens the strip it is over and
// dims the words until it leaves the hero or reaches a button; a tap opens a strip
// and dims the words, then both go back after a moment. hero.css decides which of
// the two a device follows, so the server HTML is the same for every visitor.
export function HeroStage({ photos, children }: { photos: SectionImage[]; children: ReactNode }) {
  const [tapped, setTapped] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // Once released, the extra photos stay mounted even if the preloader's state moves on.
  const preloaderDone = usePreloaderMediaLoaded();
  const [released, setReleased] = useState(false);
  if (preloaderDone && !released) setReleased(true);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // A finger tap on a trackpad iPad opens through `hovered`; the timer closes it only
  // if the trackpad has not moved since.
  const openedByTouch = useRef(false);
  const several = photos.length > 1;
  const layout = heroLayout(photos.length);
  const sizes = heroPhotoSizes(photos.length);

  useEffect(() => () => clearTimeout(tapTimer.current), []);

  // With one photo there is nothing to open: the strip is the whole hero.
  function enter(i: number, e: PointerEvent) {
    if (e.pointerType === "touch" || !several) return;
    openedByTouch.current = false;
    setHovered(i);
  }

  function tap(i: number, e: PointerEvent) {
    if (e.pointerType !== "touch" || !several) return;
    openedByTouch.current = true;
    setTapped(i);
    setHovered(i);
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      setTapped(null);
      if (openedByTouch.current) setHovered(null);
    }, TAP_OPEN_MS);
  }

  function leave(e: PointerEvent) {
    if (e.pointerType === "touch") return;
    setHovered(null);
  }

  const rowStyle = {
    "--hero-count-wide": layout.wide.count,
    "--hero-open-wide": layout.wide.open,
    "--hero-count-narrow": layout.narrow.count,
    "--hero-open-narrow": layout.narrow.open,
  } as CSSProperties;

  return (
    <section
      className="hm-hero relative h-svh min-h-[600px] overflow-hidden bg-background"
      onPointerLeave={leave}
    >
      {photos.length > 0 ? (
        <div className="hm-hero-strips absolute inset-0 z-0" style={rowStyle}>
          {photos.map((photo, i) => (
            <div
              key={`${i}:${photo.url}`}
              className={i === 0 ? "hm-hero-strip" : "hm-hero-strip bg-muted"}
              data-tapped={i === tapped ? "" : undefined}
              data-hovered={i === hovered ? "" : undefined}
              data-wide-only={i >= HERO_PHONE_MAX_PHOTOS ? "" : undefined}
              onPointerEnter={(e) => enter(i, e)}
              onPointerUp={(e) => tap(i, e)}
            >
              <div className="hm-hero-photo">
                {(i === 0 || released) && (
                  <SmartImage
                    src={photo.url}
                    alt={i === 0 ? "Hussain.Art" : ""}
                    fill
                    preload={i === 0}
                    loading={i < HERO_PHONE_MAX_PHOTOS ? "eager" : "lazy"}
                    sizes={sizes}
                    className="object-cover object-center"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-muted" />
      )}
      {children}
    </section>
  );
}
