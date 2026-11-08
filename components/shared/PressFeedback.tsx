"use client";

import { useEffect } from "react";
import {
  PRESSABLE,
  TOUCH_PRESS_DELAY_MS,
  centreGeometry,
  isTransparentColor,
  movedTooFar,
  releaseDelay,
  rippleGeometry,
} from "@/lib/press-feedback";

// The one place pressable controls learn they were pressed (MO1). It sets
// `data-pressed` and the ripple's start point on the pressed element; the motion
// itself is CSS (.hm-press in app/styles/controls.css). Pointer events work on
// touch as well, so the press shows on iPhone, where :active alone does not.
type Press = { el: HTMLElement; startedAt: number };

function pressableFrom(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>(PRESSABLE);
  if (!el || el.matches(":disabled, [aria-disabled='true']")) return null;
  return el;
}

function press(el: HTMLElement, geometry: { x: number; y: number; r: number }): Press {
  el.style.setProperty("--press-x", `${geometry.x}px`);
  el.style.setProperty("--press-y", `${geometry.y}px`);
  el.style.setProperty("--press-r", `${geometry.r}px`);
  const fill = getComputedStyle(el).backgroundColor;
  if (isTransparentColor(fill)) {
    el.style.removeProperty("--press-fill");
    el.style.removeProperty("--press-fill-mix");
  } else {
    el.style.setProperty("--press-fill", fill);
    el.style.setProperty("--press-fill-mix", "75%");
  }
  el.removeAttribute("data-pressed");
  el.setAttribute("data-press-reset", "");
  void el.offsetWidth;
  el.removeAttribute("data-press-reset");
  el.setAttribute("data-pressed", "");
  return { el, startedAt: performance.now() };
}

function release(current: Press | null) {
  if (!current) return;
  const { el, startedAt } = current;
  window.setTimeout(() => el.removeAttribute("data-pressed"), releaseDelay(performance.now() - startedAt));
}

export function PressFeedback() {
  useEffect(() => {
    let active: Press | null = null;
    let pending: { el: HTMLElement; x: number; y: number; timer: number } | null = null;

    const startPending = () => {
      if (!pending) return;
      window.clearTimeout(pending.timer);
      active = press(pending.el, rippleGeometry(pending.el.getBoundingClientRect(), pending.x, pending.y));
      pending = null;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary) return;
      const el = pressableFrom(e.target);
      if (!el) return;
      release(active);
      active = null;
      if (e.pointerType === "touch") {
        if (pending) window.clearTimeout(pending.timer);
        pending = { el, x: e.clientX, y: e.clientY, timer: window.setTimeout(startPending, TOUCH_PRESS_DELAY_MS) };
        return;
      }
      active = press(el, rippleGeometry(el.getBoundingClientRect(), e.clientX, e.clientY));
    };

    const onMove = (e: PointerEvent) => {
      if (!pending || !e.isPrimary) return;
      if (movedTooFar(e.clientX - pending.x, e.clientY - pending.y)) {
        window.clearTimeout(pending.timer);
        pending = null;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      if (pending && e.type === "pointerup") startPending();
      if (pending) {
        window.clearTimeout(pending.timer);
        pending = null;
      }
      release(active);
      active = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || (e.key !== "Enter" && e.key !== " ")) return;
      const el = pressableFrom(e.target);
      if (!el) return;
      release(active);
      active = press(el, centreGeometry(el.getBoundingClientRect()));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      release(active);
      active = null;
    };

    const options = { capture: true, passive: true } as const;
    document.addEventListener("pointerdown", onDown, options);
    document.addEventListener("pointermove", onMove, options);
    document.addEventListener("pointerup", onUp, options);
    document.addEventListener("pointercancel", onUp, options);
    document.addEventListener("keydown", onKeyDown, options);
    document.addEventListener("keyup", onKeyUp, options);
    return () => {
      if (pending) window.clearTimeout(pending.timer);
      document.removeEventListener("pointerdown", onDown, options);
      document.removeEventListener("pointermove", onMove, options);
      document.removeEventListener("pointerup", onUp, options);
      document.removeEventListener("pointercancel", onUp, options);
      document.removeEventListener("keydown", onKeyDown, options);
      document.removeEventListener("keyup", onKeyUp, options);
    };
  }, []);

  return null;
}
