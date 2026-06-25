"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("cursor-none");

    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let expanded = false;
    let rafId: number;

    const INTERACTIVE = "a, button, input, textarea, select, label, [role='button'], img, [data-cursor-expand]";

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as Element | null;
      expanded = !!target?.closest(INTERACTIVE);
    };

    const tick = () => {
      // dot follows tightly
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;

      // ring lags behind
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX}px, ${dotY}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
        ringRef.current.classList.toggle("is-expanded", expanded);
      }

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
      {/* Dot — tight follower */}
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-2 w-2 rounded-full bg-black dark:bg-white" />
      </div>

      {/* Ring — lagging follower, expands on hover */}
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring fixed top-0 left-0 z-[9998] pointer-events-none will-change-transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="cursor-ring-inner h-10 w-10 rounded-full border border-black/60 dark:border-white/60 transition-[width,height,opacity] duration-200" />
      </div>
    </>
  );
}
