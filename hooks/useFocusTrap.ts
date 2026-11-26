"use client";

import { useEffect, useRef } from "react";
import { useLatest } from "@/hooks/useLatest";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  );
}

/**
 * Focus back on an element after a window closes, with no focus ring when it had none: a card
 * opened with a mouse or a finger would otherwise get the browser's ring when the window is
 * closed with Escape (a key press). The ring comes back once focus moves on.
 */
function focusQuietly(element: HTMLElement) {
  element.setAttribute("data-focus-quiet", "");
  element.addEventListener("blur", () => element.removeAttribute("data-focus-quiet"), { once: true });
  element.focus({ preventScroll: true });
}

/** `returnTo` picks where focus goes on close (a popup that moved on: the card it ended on). */
export function useFocusTrap<T extends HTMLElement>(returnTo?: () => HTMLElement | null) {
  const containerRef = useRef<T>(null);
  const returnToRef = useLatest(returnTo);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const ringShown = previouslyFocused?.matches?.(":focus-visible") ?? false;
    // Read when the window closes: the popup may have moved on to another item by then.
    const focusTarget = () => returnToRef.current?.() ?? previouslyFocused;

    const initial =
      container.querySelector<HTMLElement>("[data-autofocus]") ?? focusableWithin(container)[0];
    (initial ?? container).focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !container) return;

      const active = document.activeElement as HTMLElement | null;
      if (active && !container.contains(active)) return;

      const items = focusableWithin(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const target = focusTarget();
      if (!target?.focus) return;
      if (ringShown) target.focus({ preventScroll: true });
      else focusQuietly(target);
    };
  }, [returnToRef]);

  return containerRef;
}
