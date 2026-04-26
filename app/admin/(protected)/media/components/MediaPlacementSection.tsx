"use client";

import type { MediaCategory } from "../lib/types";
import { MEDIA_CATEGORIES } from "../lib/utils";

export default function MediaPlacementSection({
  categories,
  toggleCategory,
  isPublic,
  setIsPublic,
}: {
  categories: MediaCategory[];
  toggleCategory: (key: MediaCategory) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}) {
  return (
    <section className="rounded-3xl border p-5 space-y-4">
      <div className="text-sm font-medium">Placement</div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MEDIA_CATEGORIES.map((c) => {
          const selected = categories.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleCategory(c.key)}
              className={[
                "relative overflow-hidden rounded-2xl border p-4 text-left text-sm transition-all",
                "hover:-translate-y-[1px] hover:shadow-md",
                selected
                  ? "border-foreground/30 shadow-lg ring-2 ring-foreground/15 bg-accent/35 scale-[1.01]"
                  : "hover:bg-accent/15",
              ].join(" ")}
            >
              {selected ? (
                <div className="pointer-events-none absolute inset-0 opacity-70">
                  <div className="absolute -inset-16 bg-radial from-foreground/10 via-transparent to-transparent" />
                </div>
              ) : null}

              <div className="relative">
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.hint}</div>
              </div>
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Public
      </label>
    </section>
  );
}