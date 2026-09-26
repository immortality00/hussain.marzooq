"use client";

import { useEffect, type RefObject } from "react";
import type { GlobeMethods } from "react-globe.gl";

const RESUME_MARGIN = "100px 0px";

export function useGlobeOffscreenPause(
  globeRef: RefObject<GlobeMethods | undefined>,
  wrapRef: RefObject<HTMLDivElement | null>,
  mounted: boolean
) {
  useEffect(() => {
    const globe = globeRef.current;
    const node = wrapRef.current;
    if (!mounted || !globe || !node) return;

    let paused = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!paused) globe.pauseAnimation();
          paused = true;
          return;
        }
        if (!paused) return;
        paused = false;
        const controls = globe.controls();
        const rotating = controls.autoRotate;
        controls.autoRotate = false;
        globe.resumeAnimation();
        controls.autoRotate = rotating;
      },
      { rootMargin: RESUME_MARGIN }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (paused) globe.resumeAnimation();
    };
  }, [globeRef, wrapRef, mounted]);
}
