"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { usePageTransition } from "@/components/transitions/TransitionContext";
import { canGoBackOnSite } from "@/lib/client/history-entry";

// "Back" on every detail page. When the page before this one is part of the site it goes
// back in history, so the visitor lands exactly where they were — the page puts its search,
// results and scroll back. Opened from outside the site, it opens the listing instead. It is
// a real link to the listing, so it works before the page has loaded, and a Cmd/Ctrl or
// middle click opens the listing in a new tab. `part` marks which one it is on a page with a
// title bar (the page's own, or the bar's), for the flight between them
// (components/shared/title-bar/).
export function BackButton({ fallbackHref, part }: { fallbackHref: string; part?: "page" | "bar" }) {
  const transition = usePageTransition();
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (canGoBackOnSite()) window.history.back();
    else if (transition) transition.navigate(fallbackHref);
    else router.push(fallbackHref);
  }

  return (
    <Button href={fallbackHref} data-no-transition data-title-back={part} onClick={onClick}>
      Back
    </Button>
  );
}
