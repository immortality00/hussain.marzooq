"use client";

import { useState } from "react";
import type { PageSettings } from "@/lib/server/page-settings";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";

const LABELS: Record<string, string> = {
  photography: "Photography",
  videography: "Videography",
  nft: "NFT",
  dancing: "Dancing",
  "web-development": "Web Development",
};

export function PagesAdminClient({ initialPages }: { initialPages: PageSettings[] }) {
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState<string | null>(null);
  const { feedback, setFeedback, run } = useAdminAction();

  async function toggle(slug: string, nextActive: boolean) {
    setLoading(slug);
    await run(
      async () => {
        const res = await fetch(`/api/admin/page-settings/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextActive }),
        });
        if (!res.ok) throw new Error("Failed to update. Try again.");
        setPages((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, isActive: nextActive } : p)),
        );
      },
      { successText: `${LABELS[slug]} ${nextActive ? "activated" : "deactivated"}.` },
    );
    setLoading(null);
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Page Visibility</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Inactive pages redirect visitors to the homepage and are hidden from the Work overlay.
      </p>

      <div className="space-y-3">
        {pages.map(({ slug, isActive }) => (
          <div
            key={slug}
            className="flex items-center justify-between rounded-2xl border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{LABELS[slug]}</p>
              <p className="text-xs text-muted-foreground">/{slug}</p>
            </div>
            <button
              type="button"
              disabled={loading === slug}
              onClick={() => toggle(slug, !isActive)}
              className={[
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                isActive ? "bg-foreground" : "bg-muted",
              ].join(" ")}
              aria-checked={isActive}
              role="switch"
              aria-label={`Toggle ${LABELS[slug]}`}
            >
              <span
                className={[
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                  isActive ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
        ))}
      </div>

      <AdminActionFeedback feedback={feedback} />
    </div>
  );
}
