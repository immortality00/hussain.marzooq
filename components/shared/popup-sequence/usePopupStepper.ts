"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLatest } from "@/hooks/useLatest";
import { originOfCard, type ExpandOrigin } from "@/lib/client/expand-origin";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import {
  arrowStep,
  recentSamples,
  releaseVelocity,
  swipeStep,
  type StepDirection,
  type SwipeSample,
} from "@/lib/popup-sequence";
import type { PopupNav } from "./usePopupSequence";

/** MO3's curve: fast, then slow. */
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
/** The next item eases in from this far on the side it comes from. */
const ENTER_PX = 24;
const ENTER_MS = 200;
/** A swiped photo carries on off the side it was thrown to. */
const EXIT_MS = 180;
/** A swipe that doesn't move on goes back. */
const SETTLE_MS = 200;
/** How far a finger moves before a swipe is told apart from a scroll. */
const SLOP_PX = 10;

type Gesture = { id: number; x: number; y: number; dx: number; dragging: boolean; samples: SwipeSample[] };

/**
 * Previous / next inside a popup: the buttons' `step`, the ← and → keys, and a sideways
 * swipe on the media (touch only). The media (`surfaceRef`) follows the finger and is thrown
 * off the way it was swiped; the next one eases in from that side. Keys switch at once, and
 * so does everything under reduced motion. Nothing moves when there is no item that way.
 * After each move the popup's close is pointed at the new item's card (`retarget`).
 */
export function usePopupStepper({
  itemId,
  nav,
  retarget,
}: {
  itemId: string;
  nav: PopupNav | null;
  retarget: (origin: ExpandOrigin | null) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const navRef = useLatest(nav);
  const entering = useRef<StepDirection | null>(null);
  const exiting = useRef(false);
  const shownId = useRef(itemId);
  const hasNav = nav !== null;

  const go = useCallback(
    (direction: StepDirection, animate: boolean) => {
      const current = navRef.current;
      if (!current || exiting.current) return;
      if (direction === 1 ? !current.hasNext : !current.hasPrevious) return;
      entering.current = animate && !prefersReducedMotion() ? direction : null;
      current.step(direction);
    },
    [navRef]
  );

  useEffect(() => {
    if (!hasNav) return;
    // Caught before the page hears it, so the cylinder and the scroll view behind don't move too.
    function onKey(event: KeyboardEvent) {
      const direction = arrowStep(event);
      if (direction === null) return;
      event.preventDefault();
      event.stopPropagation();
      go(direction, false);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, hasNav]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area || !hasNav) return;
    let gesture: Gesture | null = null;
    let swallowClick = false;
    let disposed = false;

    const move = (dx: number) => {
      const surface = surfaceRef.current;
      if (surface) surface.style.translate = dx ? `${dx}px 0` : "";
    };

    function settle(dx: number) {
      move(0);
      if (dx && !prefersReducedMotion()) {
        surfaceRef.current?.animate([{ translate: `${dx}px 0` }, { translate: "0px 0" }], { duration: SETTLE_MS, easing: EASE });
      }
    }

    function release(dx: number, velocity: number) {
      const current = navRef.current;
      const surface = surfaceRef.current;
      const direction = swipeStep({
        dx,
        velocity,
        width: area!.clientWidth,
        canPrevious: Boolean(current?.hasPrevious),
        canNext: Boolean(current?.hasNext),
      });
      if (direction === null || !surface) return settle(dx);
      if (prefersReducedMotion()) return go(direction, false);
      if (direction === 1 && !current?.nextLoaded) {
        // The next page has to load first: go back, and the next item eases in once it is here.
        settle(dx);
        return go(direction, true);
      }

      move(0);
      exiting.current = true;
      const to = -direction * (area!.clientWidth + ENTER_PX);
      const exit = surface.animate(
        [
          { translate: `${dx}px 0`, opacity: 1 },
          { translate: `${to}px 0`, opacity: 0 },
        ],
        { duration: EXIT_MS, easing: EASE, fill: "forwards" }
      );
      exit.finished.then(
        () => {
          exiting.current = false;
          if (disposed) return;
          entering.current = direction;
          // The list changed while it flew off and there is nothing that way now: bring it back.
          if (!navRef.current?.step(direction)) {
            entering.current = null;
            surface.getAnimations().forEach((a) => a.cancel());
          }
        },
        () => {
          exiting.current = false;
        }
      );
    }

    function onDown(event: PointerEvent) {
      swallowClick = false;
      if (event.pointerType === "mouse" || !event.isPrimary || exiting.current) return;
      gesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        dx: 0,
        dragging: false,
        samples: [{ x: event.clientX, t: event.timeStamp }],
      };
    }

    function onMove(event: PointerEvent) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dx) < SLOP_PX && Math.abs(dy) < SLOP_PX) return;
        // Up and down is the page's: the browser scrolls, and this swipe is over.
        if (Math.abs(dy) >= Math.abs(dx)) {
          gesture = null;
          return;
        }
        gesture.dragging = true;
        try {
          area!.setPointerCapture(event.pointerId);
        } catch {
          // A pointer the browser no longer tracks: the swipe still works without capture.
        }
        surfaceRef.current?.getAnimations().forEach((a) => a.cancel());
      }
      gesture.samples = recentSamples(gesture.samples, { x: event.clientX, t: event.timeStamp });
      const current = navRef.current;
      const open = dx < 0 ? current?.hasNext : current?.hasPrevious;
      gesture.dx = open ? dx : 0;
      if (!prefersReducedMotion()) move(gesture.dx);
    }

    function onUp(event: PointerEvent) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const { dragging, dx, samples } = gesture;
      gesture = null;
      if (!dragging) return;
      swallowClick = true;
      release(dx, releaseVelocity(samples));
    }

    function onCancel(event: PointerEvent) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const { dragging, dx } = gesture;
      gesture = null;
      if (dragging) settle(dx);
    }

    // The click a swipe ends with is not a tap (it would start a video's Play).
    function onClick(event: MouseEvent) {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    }

    area.addEventListener("pointerdown", onDown);
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerup", onUp);
    area.addEventListener("pointercancel", onCancel);
    area.addEventListener("click", onClick, true);
    return () => {
      disposed = true;
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerup", onUp);
      area.removeEventListener("pointercancel", onCancel);
      area.removeEventListener("click", onClick, true);
    };
  }, [go, hasNav, navRef]);

  useLayoutEffect(() => {
    if (shownId.current === itemId) return;
    shownId.current = itemId;
    retarget(originOfCard(itemId));

    const surface = surfaceRef.current;
    const direction = entering.current;
    entering.current = null;
    if (!surface) return;
    surface.getAnimations().forEach((a) => a.cancel());
    surface.style.translate = "";
    if (direction === null) return;
    surface.animate(
      [
        { translate: `${direction * ENTER_PX}px 0`, opacity: 0 },
        { translate: "0px 0", opacity: 1 },
      ],
      { duration: ENTER_MS, easing: EASE }
    );
  }, [itemId, retarget]);

  return { areaRef, surfaceRef, step: (direction: StepDirection) => go(direction, true) };
}
