"use client";

import Link from "next/link";
import { ChipScroller } from "@/components/shared/ChipScroller";

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
  if (!chips.length) return null;

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
