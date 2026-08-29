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

const CARD_W = 200;
const CARD_H = 300;
const DRAG_THRESHOLD = 6;
const ARC_SPACING = 26;
const DRAG_SENSITIVITY = 0.22;
const SWAY_DURATION = 22;

const ARC_RADIUS = Math.round(CARD_W / 2 / Math.tan((ARC_SPACING / 2) * (Math.PI / 180)));

function maxSway(count: number) {
  return count > 1 ? ((count - 1) / 2) * ARC_SPACING : 0;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WorkOverlay({ open, onClose }: Props) {
  const [cards, setCards] = useState<DisciplineCard[]>([]);
  const [scale, setScale] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const rot = useRef({ val: 0 });
  const sway = useRef({ p: 0 });
  const swayTween = useRef<gsap.core.Tween | null>(null);
  const maxRotRef = useRef(0);

  const drag = useRef({ active: false, didDrag: false, startX: 0, startRot: 0 });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/work-overlay")
      .then((r) => r.json())
      .then((data: DisciplineCard[]) => {
        setCards(data);
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
  }, []);

  const applyRotation = useCallback(() => {
    if (cylinderRef.current) {
      cylinderRef.current.style.transform = `rotateY(${rot.current.val}deg)`;
    }
  }, []);

  const startSway = useCallback(() => {
    swayTween.current?.kill();
    const amp = maxRotRef.current;
    if (amp <= 0) {
      rot.current.val = 0;
      applyRotation();
      return;
    }
    swayTween.current = gsap.to(sway.current, {
      p: sway.current.p + Math.PI * 2,
      duration: SWAY_DURATION,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        rot.current.val = amp * Math.sin(sway.current.p);
        applyRotation();
      },
    });
  }, [applyRotation]);

  const stopSway = useCallback(() => {
    swayTween.current?.kill();
    swayTween.current = null;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    stopSway();
    drag.current = { active: true, didDrag: false, startX: e.clientX, startRot: rot.current.val };

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - drag.current.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) drag.current.didDrag = true;
      if (drag.current.didDrag) {
        const amp = maxRotRef.current;
        const next = drag.current.startRot + dx * DRAG_SENSITIVITY;
        rot.current.val = Math.max(-amp, Math.min(amp, next));
        applyRotation();
      }
    }

    function end() {
      drag.current.active = false;
      const amp = maxRotRef.current;
      if (amp > 0) sway.current.p = Math.asin(Math.max(-1, Math.min(1, rot.current.val / amp)));
      startSway();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  }, [stopSway, applyRotation, startSway]);

  useEffect(() => {
    maxRotRef.current = maxSway(cards.length);
    if (open && cards.length > 0) startSway();
    return () => stopSway();
  }, [cards, open, startSway, stopSway]);

  useEffect(() => {
    function fit() {
      const count = cards.length || 5;
      const half = ARC_RADIUS * Math.sin((maxSway(count) * Math.PI) / 180) + CARD_W / 2;
      const sceneW = Math.max(half * 2, CARD_W);
      setScale(Math.min(1, (window.innerWidth - 32) / sceneW));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [cards]);

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
    } else {
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
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const count = cards.length;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black/92 backdrop-blur-md"
      style={{ opacity: 0, pointerEvents: "none" }}
      aria-modal="true"
      role="dialog"
      aria-label="Work disciplines"
    >
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

      <div
        style={{ perspective: "1200px", transform: `scale(${scale})` }}
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
            const theta = (i - (count - 1) / 2) * ARC_SPACING;

            return (
              <div
                key={card.slug}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${theta}deg) translateZ(${ARC_RADIUS}px)`,
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
                    <SmartImage
                      src={card.imageUrl}
                      alt={card.label}
                      fill
                      draggable={false}
                      loading="eager"
                      sizes="200px"
                      className="object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative z-10 p-5">
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
