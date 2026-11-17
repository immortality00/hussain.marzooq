"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ChipScroller } from "@/components/shared/ChipScroller";
import { scrollLeftToCentre } from "@/lib/chip-scroll";
import { ALL_TAGS_SLUG, type TagChip } from "./tag-chips";

export type { TagChip };

export function TagChipRow({
  chips,
  activeSlug,
  scroll = false,
  boxed = false,
  className,
}: {
  chips: TagChip[];
  // The tag page being shown; absent on the discipline page itself, where "All" is current.
  activeSlug?: string;
  // Single sideways-scrolling line (used in the viewers' toolbars), versus a
  // plain wrapping block.
  scroll?: boolean;
  // Wrap the row in a bordered panel so it reads as a contained control, like
  // the search box and mode switcher around it.
  boxed?: boolean;
  className?: string;
}) {
  const current = activeSlug ?? ALL_TAGS_SLUG;
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On a narrow screen the current tag can sit past the edge of the row: scroll it to the
  // middle at once (no animation), before the row is painted when arriving in the site.
  useLayoutEffect(() => {
    const chip = activeRef.current;
    const row = chip?.parentElement;
    if (!chip || !row || row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const target = scrollLeftToCentre(
      { left: rowBox.left, width: rowBox.width, scrollLeft: row.scrollLeft },
      { left: chipBox.left, width: chipBox.width },
    );
    if (target !== null) row.scrollLeft = target;
  }, [current]);

  if (!chips.length) return null;

  const chipEls = chips.map((chip) => {
    const active = chip.slug === current;
    return (
      <Link
        key={chip.href}
        ref={active ? activeRef : undefined}
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

  const row = (rowClassName?: string) =>
    scroll ? (
      <ChipScroller className={`gap-1.5 touch-pan-x${rowClassName ? ` ${rowClassName}` : ""}`}>{chipEls}</ChipScroller>
    ) : (
      <div className={`flex flex-wrap gap-1.5${rowClassName ? ` ${rowClassName}` : ""}`}>{chipEls}</div>
    );

  if (boxed) {
    return (
      <div
        className={`rounded-xl border bg-background px-5 py-1.5${className ? ` ${className}` : ""}`}
      >
        {row()}
      </div>
    );
  }

  return row(className);
}
