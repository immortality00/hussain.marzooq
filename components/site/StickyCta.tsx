"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

export function StickyCta({
  title = "Ready to book?",
  description = "Tell me what you need and I’ll reply with the best next step.",
  buttonLabel = "Book",
  href = "/contact",
}: {
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
}) {
  const [hiddenByModal, setHiddenByModal] = useState(false);
  const pathname = usePathname();
  const magneticRef = useMagneticHover<HTMLAnchorElement & HTMLButtonElement>();
  const shown = useRevealOnScroll();

  useEffect(() => {
    function onOpen() {
      setHiddenByModal(true);
    }
    function onClose() {
      setHiddenByModal(false);
    }

    window.addEventListener("hm_modal_open", onOpen);
    window.addEventListener("hm_modal_close", onClose);

    return () => {
      window.removeEventListener("hm_modal_open", onOpen);
      window.removeEventListener("hm_modal_close", onClose);
    };
  }, []);

  const isMounted = useMemo(() => {
    return !hiddenByModal || pathname === "/contact";
  }, [hiddenByModal, pathname]);

  if (!isMounted) return <div data-sticky-cta hidden />;

  return (
    <div
      data-sticky-cta
      className={[
        "fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl",
        "transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] will-change-[translate] motion-reduce:transition-none",
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4 rounded-[2rem] border bg-card px-4 py-3 shadow-[var(--shadow-elevated)]">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button ref={magneticRef} href={href} variant="solid">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}