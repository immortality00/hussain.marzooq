"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

const REGION_ID = "admin-sticky-region";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AdminStickyRegion() {
  return (
    <div
      id={REGION_ID}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col items-center gap-2 px-2 pt-2 md:px-4 md:pt-4"
    />
  );
}

export function AdminStickyPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;

  const region = document.getElementById(REGION_ID);
  if (!region) return null;

  return createPortal(
    <div className="pointer-events-auto w-full max-w-6xl">{children}</div>,
    region
  );
}
