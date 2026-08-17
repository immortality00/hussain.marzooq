"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/shared/Button";

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

  const isVisible = useMemo(() => {
    return !hiddenByModal || pathname === "/contact";
  }, [hiddenByModal, pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border bg-card px-4 py-3 shadow-[var(--shadow-elevated)]">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button href={href} variant="solid">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}