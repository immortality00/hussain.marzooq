"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StickyCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onOpen() {
      setHidden(true);
    }
    function onClose() {
      setHidden(false);
    }

    window.addEventListener("hm_modal_open", onOpen);
    window.addEventListener("hm_modal_close", onClose);

    return () => {
      window.removeEventListener("hm_modal_open", onOpen);
      window.removeEventListener("hm_modal_close", onClose);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl">
      <div className="surface-3 flex items-center justify-between gap-4 rounded-[1.75rem] border px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">Ready to book?</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Tell me what you need and I’ll reply with the best next step.
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            href="/contact"
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}