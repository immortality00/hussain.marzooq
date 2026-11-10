"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLatest } from "@/hooks/useLatest";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import {
  boxOf,
  containBox,
  ghostFrames,
  isOnScreen,
  originWithin,
  takeOrigin,
  uniformRadii,
  type Box,
  type ExpandOrigin,
  type GhostFrame,
} from "@/lib/client/expand-origin";
import { createGhost, mediaReady } from "./ghost";

/** Ease-out (MO1's curve): fast, then slow. */
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const OPEN_MS = 350;
const CLOSE_MS = 250;
const FADE_MS = 200;
const HANDOFF_MS = 150;
const PANEL_FROM = "scale(0.95)";

type Run = {
  anims: Animation[];
  ghost: HTMLElement | null;
  cancelled: boolean;
};

/** Where the photo ends up in the popup, and the corners it ends with. */
function photoTarget(target: HTMLElement, ratio: number | null): { box: Box; frames: (from: Box, o: ExpandOrigin) => [GhostFrame, GhostFrame] } {
  const area = boxOf(target);
  const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
  const isPhoto = Boolean(target.querySelector("img")) && ratio !== null;
  const box = isPhoto ? containBox(area, ratio) : area;
  const fills = Math.abs(box.width - area.width) < 1 && Math.abs(box.height - area.height) < 1;
  const toRadii = uniformRadii(fills ? radius : 0);
  return { box, frames: (from, o) => ghostFrames(from, box, o.radii, toRadii) };
}

/** Inline styles set from outside React's render, on DOM nodes the hook does not own. */
function setStyle(el: HTMLElement, props: Partial<Pick<CSSStyleDeclaration, "opacity" | "transformOrigin">>) {
  Object.assign(el.style, props);
}

function originBox(origin: ExpandOrigin): Box {
  return origin.element?.isConnected ? boxOf(origin.element) : origin.box;
}

/**
 * A popup that grows out of the card that opened it (MO3). The card records
 * itself with `rememberOrigin` on tap; the popup's panel takes `panelRef`, its
 * media area carries `data-expand-target`, and every way of closing calls
 * `requestClose`, which plays the way back before `onClose`.
 */
export function useCardExpand<T extends HTMLElement>(onClose: () => void) {
  const panelRef = useRef<T>(null);
  const originRef = useRef<ExpandOrigin | null | undefined>(undefined);
  const runRef = useRef<Run | null>(null);
  const closingRef = useRef(false);
  const onCloseRef = useLatest(onClose);

  useLayoutEffect(() => {
    if (originRef.current === undefined) originRef.current = takeOrigin();
    const origin = originRef.current;
    const panel = panelRef.current;
    const root = panel?.parentElement;
    if (!origin || !panel || !root || prefersReducedMotion()) return;

    const target = origin.src ? panel.querySelector<HTMLElement>("[data-expand-target]") : null;
    setStyle(root, { opacity: "0" });
    if (target) setStyle(target, { opacity: "0" });
    return () => {
      setStyle(root, { opacity: "" });
      if (target) setStyle(target, { opacity: "" });
    };
  }, []);

  useEffect(() => {
    const origin = originRef.current;
    const panel = panelRef.current;
    const root = panel?.parentElement;
    if (!origin || !panel || !root || prefersReducedMotion()) return;

    const run: Run = { anims: [], ghost: null, cancelled: false };
    runRef.current = run;
    const from = originBox(origin);
    const timing = { duration: OPEN_MS, easing: EASE, fill: "both" } as const;
    const target = origin.src ? panel.querySelector<HTMLElement>("[data-expand-target]") : null;

    if (target && origin.src) {
      const { box, frames } = photoTarget(target, origin.ratio);
      run.ghost = createGhost(origin.src, box);
      run.anims.push(run.ghost.animate(frames(from, origin), timing));
      void Promise.all([run.anims[0].finished, mediaReady(target)])
        .then(() => {
          if (run.cancelled || closingRef.current || !run.ghost) return;
          setStyle(target, { opacity: "" });
          const ghost = run.ghost;
          return ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: HANDOFF_MS, easing: EASE }).finished.then(() => {
            ghost.remove();
            if (run.ghost === ghost) run.ghost = null;
          });
        })
        .catch(() => {});
    } else {
      setStyle(panel, { transformOrigin: originWithin(boxOf(panel), from) });
      run.anims.push(panel.animate([{ transform: PANEL_FROM }, { transform: "none" }], timing));
    }

    setStyle(root, { opacity: "" });
    run.anims.push(root.animate([{ opacity: 0 }, { opacity: 1 }], timing));

    return () => {
      run.cancelled = true;
      run.anims.forEach((a) => a.cancel());
      run.ghost?.remove();
      setStyle(panel, { transformOrigin: "" });
      if (target) setStyle(target, { opacity: "" });
      if (runRef.current === run) runRef.current = null;
    };
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const done = () => onCloseRef.current();
    const run = runRef.current;
    const origin = originRef.current;
    const panel = panelRef.current;
    const root = panel?.parentElement;
    if (!run || !origin || !panel || !root || prefersReducedMotion()) return done();
    closingRef.current = true;

    const opening = run.anims.filter((a) => a.playState === "running");
    if (opening.length > 0) {
      opening.forEach((a) => a.reverse());
      void Promise.all(opening.map((a) => a.finished)).then(done, done);
      return;
    }

    run.ghost?.remove();
    run.ghost = null;
    run.anims.forEach((a) => a.cancel());
    run.anims = [];

    const from = originBox(origin);
    const cardInView =
      origin.element?.isConnected === true && isOnScreen(from, { width: window.innerWidth, height: window.innerHeight });
    const target = origin.src ? panel.querySelector<HTMLElement>("[data-expand-target]") : null;
    const duration = cardInView ? CLOSE_MS : FADE_MS;
    const timing = { duration, easing: EASE, fill: "forwards" } as const;

    if (cardInView && target && origin.src) {
      const { box, frames } = photoTarget(target, origin.ratio);
      const photo = target.querySelector("img");
      run.ghost = createGhost(photo?.currentSrc || origin.src, box);
      const [start, end] = frames(from, origin);
      setStyle(target, { opacity: "0" });
      run.anims.push(run.ghost.animate([end, start], timing));
    } else if (cardInView) {
      setStyle(panel, { transformOrigin: originWithin(boxOf(panel), from) });
      run.anims.push(panel.animate([{ transform: "none" }, { transform: PANEL_FROM }], timing));
    }

    run.anims.push(root.animate([{ opacity: 1 }, { opacity: 0 }], timing));
    void Promise.all(run.anims.map((a) => a.finished)).then(done, done);
  }, [onCloseRef]);

  return { panelRef, requestClose };
}
