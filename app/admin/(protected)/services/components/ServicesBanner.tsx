"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import type { Banner } from "../lib/ui";

export default function ServicesBanner({
  banner,
  onClose,
  containerRef,
}: {
  banner: Banner;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={containerRef} className="sticky top-3 z-40">
      <div className="relative">
        <AdminActionFeedback feedback={banner} className="mt-0 shadow-sm backdrop-blur" />
        {banner ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-xs hover:bg-accent/40"
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}