"use client";

import type { PageSeo } from "@/lib/server/page-seo";

export type SeoDraft = {
  title: string;
  description: string;
  headerTitle: string;
  headerDescription: string;
  ogImageUrl: string;
};

export function SeoPageForm({
  draft,
  isDirty,
  isSaving,
  onChange,
  onSave,
  onDiscard,
}: {
  page: PageSeo;
  draft: SeoDraft;
  isDirty: boolean;
  isSaving: boolean;
  onChange: (field: keyof SeoDraft, value: string) => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="border-t px-4 pb-4 pt-3">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            On the page — what visitors see
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Heading
            </label>
            <input
              type="text"
              value={draft.headerTitle}
              onChange={(e) => onChange("headerTitle", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={draft.headerDescription}
              onChange={(e) => onChange("headerDescription", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Search & social — what search engines see
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Page title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Meta description
            </label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {draft.description.length} chars — recommended 120–160
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              OG image URL (optional — used in Session C2)
            </label>
            <input
              type="text"
              value={draft.ogImageUrl}
              placeholder="https://res.cloudinary.com/..."
              onChange={(e) => onChange("ogImageUrl", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={onSave}
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        {isDirty && (
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent/40"
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
}
