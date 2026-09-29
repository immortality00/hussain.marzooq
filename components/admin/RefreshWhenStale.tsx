"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const STALE_AFTER_MS = 10_000;

export function RefreshWhenStale({ renderedAt }: { renderedAt: number }) {
  const router = useRouter();
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current || Date.now() - renderedAt < STALE_AFTER_MS) return;
    refreshed.current = true;
    router.refresh();
  }, [renderedAt, router]);

  return null;
}
