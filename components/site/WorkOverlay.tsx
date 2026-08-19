"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import { gsap } from "gsap";
import { X } from "lucide-react";

type DisciplineCard = {
  slug: string;
  label: string;
  href: string;
  imageUrl: string | null;
};

const EYEBROWS: Record<string, string> = {
  photography: "Still image",
  videography: "Motion",
  nft: "Digital art",
  dancing: "Movement",
  "web-development": "Digital product",
};

const CARD_W = 260;
const CARD_H = 380;
const GAP = 40;
const DRAG_THRESHOLD = 6; // px before a move is considered a drag

function getCylinderRadius(count: number) {
  return Math.round((count * (CARD_W + GAP)) / (2 * Math.PI));
}

type Props = {
  open: boolean;
  onClose: () => void;
  activeSlugs?: string[];
};

export function WorkOverlay({ open, onClose, activeSlugs }: Props) {
  const [cards, setCards] = useState<DisciplineCard[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Rotation state — stored in refs so GSAP tween can mutate without re-renders
  const rotProxy = useRef({ val: 0 });
  const autoTween = useRef<gsap.core.Tween | null>(null);

  // Drag state
  const drag = useRef({ active: false, didDrag: false, startX: 0, startRot: 0 });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/work-overlay")
      .then((r) => r.json())
      .then((data: DisciplineCard[]) => {
        const filtered = activeSlugs ? data.filter((c) => activeSlugs.includes(c.slug)) : data;
        setCards(filtered);
      })
      .catch(() => {
        setCards([
          { slug: "photography", label: "Photography", href: "/photography", imageUrl: null },
          { slug: "videography", label: "Videography", href: "/videography", imageUrl: null },
          { slug: "nft", label: "NFT", href: "/nft", imageUrl: null },
          { slug: "dancing", label: "Dancing", href: "/dancing", imageUrl: null },
          { slug: "web-development", label: "Web Development", href: "/web-development", imageUrl: null },
        ]);
      });
  }, [activeSlugs]);

  const applyRotation = useCallback(() => {
    if (cylinderRef.current) {
      cylinderRef.current.style.transform = `rotateY(${rotProxy.current.val}deg)`;
    }
  }, []);

  const startAutoRotate = useCallback((fromVal?: number) => {
    autoTween.current?.kill();
    if (fromVal !== undefined) rotProxy.current.val = fromVal;
    autoTween.current = gsap.to(rotProxy.current, {
      val: rotProxy.current.val - 360,
      duration: 60,            // slow: one full revolution in 60 seconds
      ease: "none",
      repeat: -1,
      onUpdate: applyRotation,
    });
  }, [applyRotation]);

  const stopAutoRotate = useCallback(() => {
    autoTween.current?.kill();
    autoTween.current = null;
  }, []);

  // Drag via document listeners so pointer capture never steals click events
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button / touch
    if (e.button !== 0 && e.pointerType === "mouse") return;
    stopAutoRotate();
    drag.current = { active: true, didDrag: false, startX: e.clientX, startRot: rotProxy.current.val };

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - drag.current.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) drag.current.didDrag = true;
      if (drag.current.didDrag) {
        rotProxy.current.val = drag.current.startRot + dx * 0.25;
        applyRotation();
      }
    }

    function end() {
      drag.current.active = false;
      startAutoRotate();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  }, [stopAutoRotate, applyRotation, startAutoRotate]);

  // Open / close animation — never toggle display; only animate opacity + pointerEvents
  useEffect(() => {
    if (!overlayRef.current) return;

    if (open) {
      document.body.style.overflow = "hidden";
      gsap.killTweensOf(overlayRef.current);
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.5,
        ease: "power2.out",
      });
      startAutoRotate(rotProxy.current.val);
    } else {
      stopAutoRotate();
      document.body.style.overflow = "";
      gsap.killTweensOf(overlayRef.current);
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.25,
        ease: "power2.in",
      });
    }

    return () => { document.body.style.overflow = ""; };
  }, [open, startAutoRotate, stopAutoRotate]);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const count = cards.length || 5;
  const radius = getCylinderRadius(count);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black/92 backdrop-blur-md"
      style={{ opacity: 0, pointerEvents: "none" }}
      aria-modal="true"
      role="dialog"
      aria-label="Work disciplines"
    >
      {/* Header — close button only */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 pt-6">
        <p className="text-[11px] tracking-[0.25em] text-white/30 uppercase">Work</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-colors hover:border-white/30 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      {/* 3D cylinder scene */}
      <div
        style={{ perspective: "1000px" }}
        onPointerDown={onPointerDown}
        className="relative z-10 cursor-grab select-none active:cursor-grabbing"
      >
        <div
          ref={cylinderRef}
          style={{
            width: CARD_W,
            height: CARD_H,
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {cards.map((card, i) => {
            const angle = (360 / count) * i;
            const eyebrow = EYEBROWS[card.slug] ?? "";

            return (
              <div
                key={card.slug}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <Link
                  href={card.href}
                  onClick={(e) => { if (drag.current.didDrag) { e.preventDefault(); return; } onClose(); }}
                  draggable={false}
                  className="group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-muted"
                >
                  {card.imageUrl && (
                    // The overlay stays mounted (opacity-animated, never display:none),
                    // so lazy card images get flagged as un-eager LCP candidates.
                    // Eager-load them: 5 small cards, ready before the overlay opens.
                    <SmartImage
                      src={card.imageUrl}
                      alt={card.label}
                      fill
                      draggable={false}
                      loading="eager"
                      sizes="260px"
                      className="object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative z-10 p-5">
                    <p className="mb-1 text-[9px] tracking-[0.22em] text-white/45 uppercase">{eyebrow}</p>
                    <h2 className="text-[15px] font-semibold leading-snug text-white">{card.label}</h2>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
