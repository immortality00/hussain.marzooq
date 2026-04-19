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
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="text-sm">
          <div className="font-semibold">Ready to book?</div>
          <div className="text-xs text-muted-foreground">Tell me what you need and I’ll reply fast.</div>
        </div>
        <div className="flex gap-2">
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