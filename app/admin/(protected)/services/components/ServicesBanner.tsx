"use client";

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
      {banner ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur ${
            banner.type === "ok"
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>{banner.text}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-2 py-1 text-xs hover:bg-accent/40"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}