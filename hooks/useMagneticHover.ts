"use client";

import { useEffect, useRef } from "react";

type Options = {
  maxX?: number;
  maxY?: number;
  radius?: number;
};

export function magneticOffset(
  dx: number,
  dy: number,
  reachX: number,
  reachY: number,
  maxX: number,
  maxY: number,
) {
  if (Math.abs(dx) >= reachX || Math.abs(dy) >= reachY) {
    return { x: 0, y: 0 };
  }
  return {
    x: Math.max(-1, Math.min(1, dx / reachX)) * maxX,
    y: Math.max(-1, Math.min(1, dy / reachY)) * maxY,
  };
}

export function useMagneticHover<T extends HTMLElement = HTMLElement>({
  maxX = 12,
  maxY = 8,
  radius = 60,
}: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let rafId = 0;

    const tick = () => {
      vx += (targetX - x) * 0.18 - vx * 0.55;
      vy += (targetY - y) * 0.18 - vy * 0.55;
      x += vx;
      y += vy;

      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;

      const settled =
        Math.abs(targetX - x) < 0.1 &&
        Math.abs(targetY - y) < 0.1 &&
        Math.hypot(vx, vy) < 0.1;

      if (settled && targetX === 0 && targetY === 0) {
        el.style.translate = "0px 0px";
        el.style.willChange = "";
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafId) return;
      el.style.willChange = "translate";
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const reachX = rect.width / 2 + radius;
      const reachY = rect.height / 2 + radius;
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);

      const offset = magneticOffset(dx, dy, reachX, reachY, maxX, maxY);
      targetX = offset.x;
      targetY = offset.y;

      if (targetX || targetY || x || y) start();
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.translate = "";
      el.style.willChange = "";
    };
  }, [maxX, maxY, radius]);

  return ref;
}
