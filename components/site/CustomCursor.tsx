"use client";

import { useEffect, useRef } from "react";

const COLLAPSE = "button, .hm-btn, .hm-chip, [role='button'], input, textarea, select, label";
const EXPAND = "img, [data-cursor-expand], figure";

const SPRING_K = 0.2;
const SPRING_DAMP = 0.62;
const ZONE_EXPAND = 1.6;
const ZONE_COLLAPSE = 0.5;
const STRETCH_MAX_SPEED = 42;
const STRETCH_X = 0.35;
const STRETCH_Y = 0.22;
const GHOST_MIN = 6;
const GHOST_MAX = 34;

export function stretchFor(speed: number) {
  const t = Math.min(Math.max(speed, 0) / STRETCH_MAX_SPEED, 1);
  return { sx: 1 + t * STRETCH_X, sy: 1 - t * STRETCH_Y };
}

export function stepSpring(
  pos: number,
  vel: number,
  target: number,
  k = SPRING_K,
  damp = SPRING_DAMP,
) {
  const nextVel = vel + (target - pos) * k - vel * damp;
  return { pos: pos + nextVel, vel: nextVel };
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ghost1Ref = useRef<HTMLDivElement>(null);
  const ghost2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const g1 = ghost1Ref.current;
    const g2 = ghost2Ref.current;
    const ringInner = ring?.firstElementChild as HTMLElement | null;
    if (!dot || !ring || !g1 || !g2 || !ringInner) return;

    document.documentElement.classList.add("cursor-none");

    let mouseX = -100;
    let mouseY = -100;
    let prevX = -100;
    let prevY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let ringVX = 0;
    let ringVY = 0;
    let g1X = -100;
    let g1Y = -100;
    let g2X = -100;
    let g2Y = -100;
    let velX = 0;
    let velY = 0;
    let speedSm = 0;
    let zone = 1;
    let zoneTarget = 1;
    let visible = false;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as Element | null;
      zoneTarget = target?.closest(COLLAPSE)
        ? ZONE_COLLAPSE
        : target?.closest(EXPAND)
          ? ZONE_EXPAND
          : 1;

      if (!visible) {
        visible = true;
        prevX = mouseX;
        prevY = mouseY;
        dotX = ringX = g1X = g2X = mouseX;
        dotY = ringY = g1Y = g2Y = mouseY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const tick = () => {
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;

      const rx = stepSpring(ringX, ringVX, mouseX);
      ringX = rx.pos;
      ringVX = rx.vel;
      const ry = stepSpring(ringY, ringVY, mouseY);
      ringY = ry.pos;
      ringVY = ry.vel;

      g1X += (ringX - g1X) * 0.35;
      g1Y += (ringY - g1Y) * 0.35;
      g2X += (g1X - g2X) * 0.35;
      g2Y += (g1Y - g2Y) * 0.35;

      const instVX = mouseX - prevX;
      const instVY = mouseY - prevY;
      prevX = mouseX;
      prevY = mouseY;
      velX += (instVX - velX) * 0.3;
      velY += (instVY - velY) * 0.3;
      speedSm += (Math.hypot(instVX, instVY) - speedSm) * 0.2;

      zone += (zoneTarget - zone) * 0.2;

      const { sx, sy } = stretchFor(speedSm);
      const angle = speedSm > 0.5 ? Math.atan2(velY, velX) : 0;

      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      ringInner.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(${zone * sx}, ${zone * sy})`;
      g1.style.transform = `translate(${g1X}px, ${g1Y}px)`;
      g2.style.transform = `translate(${g2X}px, ${g2Y}px)`;

      const ghost = visible
        ? Math.min(Math.max((speedSm - GHOST_MIN) / (GHOST_MAX - GHOST_MIN), 0), 1)
        : 0;
      g1.style.opacity = `${ghost * 0.8}`;
      g2.style.opacity = `${ghost * 0.4}`;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 z-[9999] opacity-0 pointer-events-none will-change-transform"
      >
        <div className="cursor-dot h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div
        ref={ghost2Ref}
        aria-hidden
        className="fixed top-0 left-0 z-[9996] opacity-0 pointer-events-none will-change-transform"
      >
        <div className="cursor-ring-inner h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div
        ref={ghost1Ref}
        aria-hidden
        className="fixed top-0 left-0 z-[9997] opacity-0 pointer-events-none will-change-transform"
      >
        <div className="cursor-ring-inner h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 z-[9998] opacity-0 pointer-events-none will-change-transform"
      >
        <div className="cursor-ring-inner h-10 w-10 rounded-full" />
      </div>
    </>
  );
}
