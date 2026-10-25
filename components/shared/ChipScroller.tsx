"use client";

import { useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// One line of chips that scrolls sideways at every width. A vertical mouse wheel
// scrolls it sideways too, while the page keeps Lenis's smooth scroll;
// data-lenis-prevent-horizontal leaves sideways trackpad swipes to the row. The
// 4px padding (cancelled by the negative margin) keeps the chips' focus rings
// from being clipped by the scroll box.
export function ChipScroller({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.scrollLeft += e.deltaY;
  }

  return (
    <div
      {...rest}
      ref={ref}
      onWheel={onWheel}
      data-lenis-prevent-horizontal=""
      className={cn(
        "-m-1 flex gap-2 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
