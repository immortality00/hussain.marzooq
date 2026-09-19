"use client";

import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY, prefersReducedMotion } from "@/lib/reduced-motion";

export type MotionPreference = "unknown" | "reduce" | "allow";

function subscribe(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", listener);

  return () => query.removeEventListener("change", listener);
}

function getSnapshot(): MotionPreference {
  return prefersReducedMotion() ? "reduce" : "allow";
}

function getServerSnapshot(): MotionPreference {
  return "unknown";
}

export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
