"use client";

import { cn } from "@/lib/utils";
import { usePullGesture, type PullRefresh } from "./usePullGesture";

/**
 * Pull to refresh (MO5), the same in every browser and in both Home Screen apps: it takes the place of
 * Safari's and Chrome's own pull (their spinner never shows here). Touch only — a mouse never pulls. The
 * blocks that come down are the ones marked data-pull-moves; `refresh` resolves with a message to show in
 * the gap, or null.
 */
export function PullToRefresh({ refresh }: { refresh: PullRefresh }) {
  const { logoRef, message } = usePullGesture(refresh);

  // Above the page's blocks, at the top of the document: it scrolls away with the gap.
  return (
    <div ref={logoRef} className="hm-pull-logo pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 justify-center">
      <span
        aria-hidden
        data-pull-signature
        className={cn("hm-wordmark hm-pull-signature h-8 text-foreground", message && "invisible")}
      />
      {message ? (
        <p role="status" className="absolute inset-x-4 inset-y-0 flex items-center justify-center text-center text-xs leading-4 text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
