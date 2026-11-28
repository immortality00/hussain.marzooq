"use client";

import { useEffect, useRef, useState } from "react";
import { useLatest } from "@/hooks/useLatest";
import { jumpPageTo } from "@/lib/client/page-scroll";
import {
  PULL_LONG_PRESS_MS,
  PULL_MAX_REFRESH_MS,
  PULL_MESSAGE_MS,
  PULL_MIN_REFRESH_MS,
  PULL_REST_PX,
  PULL_RETURN_MS,
  PULL_SETTLE_MS,
  pullArmed,
  pullDirection,
  pullOffset,
} from "@/lib/pull-refresh";
import { createPullMotion } from "./pull-motion";
import { canStartPull } from "./pull-start";
import { takeTouch, watchTouchPointers } from "./take-touch";

export type PullRefresh = () => Promise<string | null>;

type Touching = { id: number; x: number; y: number; at: number; claimed: boolean; offset: number; release: () => void };

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, ms)));

function touchOf(list: TouchList, id: number) {
  return Array.from(list).find((touch) => touch.identifier === id) ?? null;
}

/**
 * Pull to refresh (MO5). One finger at the very top of the page moving down brings the page's blocks down
 * 35% of the way and writes the signature in above them; let go far enough and `refresh` runs while its
 * light sweeps, then the page goes back. `refresh` resolves with a message for the gap, or null.
 * Only `touchmove` can stop the browser's own bounce, so it is listened to (not passively) only while the
 * page is at the top.
 */
export function usePullGesture(refresh: PullRefresh) {
  const logoRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const latestRefresh = useLatest(refresh);

  useEffect(() => {
    const logo = logoRef.current;
    const signature = logo?.querySelector<HTMLElement>("[data-pull-signature]");
    if (!logo || !signature) return;
    const motion = createPullMotion(logo, signature);
    let touching: Touching | null = null;
    let busy = false;
    let disposed = false;
    let listening = false;

    function done() {
      busy = false;
      if (!disposed) motion.finish();
    }

    async function refreshNow() {
      motion.refreshing();
      void motion.glide(PULL_REST_PX, PULL_SETTLE_MS, false);
      const started = performance.now();
      const failure = await Promise.race([
        latestRefresh.current().catch(() => null),
        wait(PULL_MAX_REFRESH_MS).then(() => null),
      ]);
      await wait(PULL_MIN_REFRESH_MS - (performance.now() - started));
      if (disposed) return;
      if (failure) {
        setMessage(failure);
        await wait(PULL_MESSAGE_MS);
        if (disposed) return;
      }
      const scrolled = window.scrollY;
      if (scrolled > 0) {
        // Scrolled while it refreshed: the gap closes at once and the page scrolls by as much, so nothing moves.
        motion.close();
        jumpPageTo(Math.max(0, scrolled - PULL_REST_PX));
      } else {
        await motion.glide(0, PULL_RETURN_MS, true);
      }
      setMessage(null);
      done();
    }

    function end(refreshes: boolean) {
      const current = touching;
      touching = null;
      if (!current?.claimed) return;
      current.release();
      if (refreshes) void refreshNow();
      else void motion.glide(0, PULL_SETTLE_MS, true).then(done);
    }

    function onStart(event: TouchEvent) {
      if (busy || touching || event.touches.length !== 1) return;
      if (window.scrollY > 0 || !canStartPull(event.target)) return;
      const touch = event.touches[0];
      touching = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        at: event.timeStamp,
        claimed: false,
        offset: 0,
        release: () => {},
      };
    }

    function claim(event: TouchEvent, dx: number, dy: number) {
      if (!touching) return false;
      // Not cancelable: the browser is already scrolling, and the touch is its.
      const direction = event.cancelable ? pullDirection(dx, dy) : "page";
      if (direction === "pending") return false;
      if (direction === "page" || event.timeStamp - touching.at > PULL_LONG_PRESS_MS) {
        touching = null;
        return false;
      }
      touching.claimed = true;
      touching.release = takeTouch();
      busy = true;
      motion.begin();
      return true;
    }

    function onMove(event: TouchEvent) {
      if (!touching) return;
      const touch = event.touches.length === 1 ? touchOf(event.touches, touching.id) : null;
      if (!touch) return end(false);
      const dy = touch.clientY - touching.y;
      if (!touching.claimed && !claim(event, touch.clientX - touching.x, dy)) return;
      event.preventDefault();
      touching.offset = pullOffset(dy);
      motion.follow(touching.offset);
    }

    function onEnd(event: TouchEvent) {
      if (!touching) return;
      const lifted = event.type === "touchend" && event.touches.length === 0;
      end(lifted && pullArmed(touching.offset));
    }

    function sync() {
      const top = window.scrollY <= 0;
      if (top === listening) return;
      listening = top;
      if (top) document.addEventListener("touchmove", onMove, { passive: false });
      else document.removeEventListener("touchmove", onMove);
    }

    const stopWatching = watchTouchPointers();
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    window.addEventListener("scroll", sync, { passive: true });
    sync();

    return () => {
      disposed = true;
      touching?.release();
      touching = null;
      if (busy) motion.finish();
      stopWatching();
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
      document.removeEventListener("touchmove", onMove);
      window.removeEventListener("scroll", sync);
    };
  }, [latestRefresh]);

  return { logoRef, message };
}
