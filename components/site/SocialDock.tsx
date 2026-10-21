"use client";

import { useHiddenByModal } from "@/hooks/useHiddenByModal";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

// The fixed column of social links. Shown by the booking bar's rule (once the page
// scrolls, or at once on a page too short to scroll) and centred in the space
// between the navbar and the bar. Motion lives in app/styles/social.css.
export function SocialDock({ children }: { children: React.ReactNode }) {
  const shown = useRevealOnScroll();
  const hiddenByModal = useHiddenByModal();
  if (hiddenByModal) return null;

  return (
    <nav
      aria-label="Social links"
      data-shown={shown || undefined}
      className="hm-social-dock pointer-events-none fixed top-16 bottom-4 left-0 z-30 flex items-center with-sticky-cta:bottom-28 md:left-5 md:with-sticky-cta:bottom-24"
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </nav>
  );
}
