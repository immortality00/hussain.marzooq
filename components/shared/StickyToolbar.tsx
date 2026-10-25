"use client";

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STICKY_OFFSET_EVENT, isStuck } from "@/lib/sticky-toolbar";

// A search/filter bar that stays under the navbar (admin: the top of the screen)
// while its results scroll. Look and geometry: app/styles/sticky-toolbar.css.
// Its parent decides how long it stays: it leaves with the parent's last row.
export function StickyToolbar({
  children,
  className,
  surface = "page",
}: {
  children: ReactNode;
  className?: string;
  surface?: "page" | "admin";
}) {
  const [bar, setBar] = useState<HTMLDivElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!bar) return () => {};
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange);
      window.addEventListener(STICKY_OFFSET_EVENT, onChange);
      bar.addEventListener("transitionend", onChange);
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
        window.removeEventListener(STICKY_OFFSET_EVENT, onChange);
        bar.removeEventListener("transitionend", onChange);
      };
    },
    [bar],
  );

  const stuck = useSyncExternalStore(
    subscribe,
    () => (bar ? isStuck(bar.getBoundingClientRect().top, parseFloat(getComputedStyle(bar).top)) : false),
    () => false,
  );

  return (
    <div
      ref={setBar}
      data-surface={surface}
      data-stuck={stuck ? "" : undefined}
      className={cn("hm-sticky-toolbar", className)}
    >
      {children}
    </div>
  );
}
