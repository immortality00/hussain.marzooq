"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { adminButtonClasses } from "@/components/admin/AdminButton";
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
            className={adminButtonClasses("default", "xs", "absolute right-3 top-1/2 -translate-y-1/2")}
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}