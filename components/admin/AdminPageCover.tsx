"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export const ADMIN_CONTENT_ID = "admin-content";

const subscribeNever = () => () => {};
const findContent = () => document.getElementById(ADMIN_CONTENT_ID);

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export function AdminPageCover() {
  const target = useSyncExternalStore(subscribeNever, findContent, () => null);
  if (!target) return null;

  return createPortal(
    <div className="absolute inset-0 z-20 rounded-2xl bg-card" onClick={stop}>
      <LoadingScreen className="sticky top-0 h-[60dvh] max-h-full" />
    </div>,
    target
  );
}
