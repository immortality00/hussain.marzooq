"use client";

import { ArrowUp } from "lucide-react";
import { useScrolledDown } from "@/hooks/useRevealOnScroll";
import { useHiddenByModal } from "@/hooks/useHiddenByModal";
import { scrollPageToTop } from "@/lib/client/page-scroll";
import { prefersReducedMotion } from "@/lib/reduced-motion";

// Bottom-right on every public page, shown once the page has scrolled (the booking bar's
// rule, without its "short page shows at once" part — there is nothing to go back up to).
// On a page with the booking bar it sits above the bar, and beside it from 1280px. Motion
// lives in app/styles/to-top.css. The admin places it with `className` (above its phone
// bottom nav) and sends focus to its own content with `focusId`.
const PUBLIC_PLACE =
  "fixed right-4 bottom-4 z-40 with-sticky-cta:bottom-28 md:right-5 md:with-sticky-cta:bottom-24 xl:with-sticky-cta:bottom-7";

export function BackToTop({ focusId = "main-content", className = PUBLIC_PLACE }: { focusId?: string; className?: string }) {
  const shown = useScrolledDown();
  const hiddenByModal = useHiddenByModal();
  if (hiddenByModal) return null;

  function toTop() {
    scrollPageToTop(prefersReducedMotion());
    document.getElementById(focusId)?.focus({ preventScroll: true });
  }

  return (
    <div
      data-shown={shown || undefined}
      inert={!shown}
      className={`hm-to-top ${className}`}
    >
      <button
        type="button"
        aria-label="Back to top"
        onClick={toTop}
        className="hm-press inline-flex size-11 items-center justify-center rounded-full border bg-card text-foreground shadow-[var(--shadow-elevated)] hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground"
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
    </div>
  );
}
