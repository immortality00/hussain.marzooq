"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { TitleBar, type TitleBarInfo } from "./TitleBar";
import { createTitleBarFlight } from "./title-bar-flight";

// A page with a title bar (UX1b): the bar, sticky under the navbar, then the page, whose heading
// carries data-title-heading (PageHeader's does). title-bar-flight.ts moves the heading — and on a
// detail page (`backHref`) Back and the person's photo — into the bar once the page scrolls, and
// back at the top. A page reopened scrolled down shows its bar on its first frame, with no
// flight. Look: app/styles/title-bar.css.
export function TitleBarFrame({
  title,
  avatarUrl,
  backHref,
  children,
}: TitleBarInfo & { backHref?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const flight = createTitleBarFlight(frame);
    return () => flight.dispose();
  }, []);

  return (
    <div ref={ref} className="hm-title-frame">
      <div className="hm-title-bar-holder">
        <TitleBar title={title} avatarUrl={avatarUrl} backHref={backHref} />
      </div>
      {children}
    </div>
  );
}
