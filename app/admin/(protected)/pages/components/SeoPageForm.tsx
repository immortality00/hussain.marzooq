"use client";

import { Type, Search } from "lucide-react";
import { GroupCard } from "./GroupCard";

export type SeoDraft = {
  title: string;
  description: string;
  headerTitle: string;
  headerDescription: string;
  ogImageUrl: string;
};

export function SeoPageForm({
  draft,
  onChange,
  detailPage = false,
}: {
  draft: SeoDraft;
  onChange: (field: keyof SeoDraft, value: string) => void;
  // Dynamic detail pages: the visible header is the record's own data, so the
  // on-page group is hidden and {name} is replaced with the record's name.
  detailPage?: boolean;
}) {
  return (
    <>
      {!detailPage && (
        <GroupCard icon={Type} label="On the page — what visitors see" tint="header">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Heading</label>
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
        </GroupCard>
      )}

      <GroupCard icon={Search} label="Search & social — what search engines see" tint="seo">
        {detailPage && (
          <p className="text-xs text-muted-foreground">
            Applies to every person&apos;s page — write <code>{"{name}"}</code> where the
            person&apos;s name should appear.
          </p>
        )}
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
      </GroupCard>
    </>
  );
}
