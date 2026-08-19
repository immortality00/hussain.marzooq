"use client";

import Link from "next/link";
import { useRef } from "react";

export type TagChip = {
  slug: string;
  label: string;
  href: string;
};

export function TagChipRow({
  chips,
  activeSlug,
  scroll = false,
  boxed = false,
  className,
}: {
  chips: TagChip[];
  activeSlug?: string;
  // Single sideways-scrolling line (used in the viewers' toolbars), versus a
  // plain wrapping block.
  scroll?: boolean;
  // Wrap the row in a bordered panel so it reads as a contained control, like
  // the search box and mode switcher around it.
  boxed?: boolean;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  if (!chips.length) return null;

  const inner = scroll
    ? "flex gap-1.5 overflow-x-auto touch-pan-x overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    : "flex flex-wrap gap-1.5";

  // A vertical mouse wheel scrolls the row sideways; data-lenis-prevent stops
  // the page's Lenis smooth-scroll from swallowing wheel/trackpad events here.
  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.scrollLeft += e.deltaY;
  }

  const chipEls = chips.map((chip) => {
    const active = chip.slug === activeSlug;
    return (
      <Link
        key={chip.slug}
        href={chip.href}
        aria-current={active ? "page" : undefined}
        className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border hover:bg-foreground hover:text-background"
        }`}
      >
        {chip.label}
      </Link>
    );
  });

  const scrollerProps = scroll
    ? { ref: scrollerRef, onWheel, "data-lenis-prevent": "" as const }
    : {};

  if (boxed) {
    return (
      <div
        className={`rounded-xl border bg-background px-5 py-1.5${className ? ` ${className}` : ""}`}
      >
        <div className={inner} {...scrollerProps}>
          {chipEls}
        </div>
      </div>
    );
  }

  return (
    <div className={`${inner}${className ? ` ${className}` : ""}`} {...scrollerProps}>
      {chipEls}
    </div>
  );
}
