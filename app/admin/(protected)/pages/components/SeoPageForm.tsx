"use client";

import { Type, Search } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { ImageField } from "@/components/admin/media-picker/ImageField";

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
  detailToken = "name",
}: {
  draft: SeoDraft;
  onChange: (field: keyof SeoDraft, value: string) => void;
  // Dynamic detail pages: the visible header is the record's own data, so the
  // on-page group is hidden and {name}/{tag} is replaced with the record's own
  // value at render time.
  detailPage?: boolean;
  detailToken?: "name" | "tag";
}) {
  const detailNoun = detailToken === "tag" ? "tag" : "person";
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
            Applies to every {detailNoun}&apos;s page — write{" "}
            <code>{`{${detailToken}}`}</code> where the {detailNoun}&apos;s{" "}
            {detailToken === "tag" ? "label" : "name"} should appear.
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
            Share image
          </label>
          <ImageField
            value={{ url: draft.ogImageUrl, publicId: "" }}
            onChange={(image) => onChange("ogImageUrl", image.url)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown when this page&apos;s link is shared on social or messaging. Leave empty to
            use the HM Visuals card.
          </p>
        </div>
      </GroupCard>
    </>
  );
}
