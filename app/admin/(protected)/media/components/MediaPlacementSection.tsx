"use client";

import type { MediaCategory } from "../lib/types";
import { MEDIA_CATEGORIES } from "../lib/utils";

export default function MediaPlacementSection({
  primaryCategory,
  setPrimaryCategory,
  categories,
  toggleCategory,
  isPublic,
  setIsPublic,
  privateGalleryTitles = [],
  categoryOptions = MEDIA_CATEGORIES,
}: {
  primaryCategory: MediaCategory | null;
  setPrimaryCategory: (value: MediaCategory) => void;
  categories: MediaCategory[];
  toggleCategory: (key: MediaCategory) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  privateGalleryTitles?: string[];
  categoryOptions?: Array<{ key: MediaCategory; label: string }>;
}) {
  const secondary = categories.filter((c) => c !== primaryCategory);
  const lockedByGallery = privateGalleryTitles.length > 0;

  return (
    <section className="space-y-5 rounded-3xl border p-5">
      <div className="text-sm font-medium">Category</div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categoryOptions.map((c) => {
          const selected = primaryCategory === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setPrimaryCategory(c.key)}
              className={[
                "relative overflow-hidden rounded-2xl border p-4 text-left text-sm transition-all",
                "hover:-translate-y-px",
                selected
                  ? "border-foreground/30 bg-accent/35 ring-2 ring-foreground/15"
                  : "hover:bg-accent/15",
              ].join(" ")}
            >
              <div className="font-medium">{c.label}</div>
            </button>
          );
        })}
      </div>

      {primaryCategory ? (
        <div className="space-y-3">
          <div className="text-sm font-medium">Additional placements</div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.filter((c) => c.key !== primaryCategory).map((c) => {
              const selected = secondary.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCategory(c.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    selected ? "bg-accent" : "hover:bg-accent/40"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic && !lockedByGallery}
          disabled={lockedByGallery}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public
      </label>

      {lockedByGallery ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Delivered privately for {privateGalleryTitles.join(", ")}. Remove it from the private
          gallery to publish it.
        </div>
      ) : null}
    </section>
  );
}