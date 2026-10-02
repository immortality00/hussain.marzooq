"use client";

import { useMemo, useState } from "react";
import { slugifyTag } from "@/lib/server/media-tags";
import { createTagRequest } from "@/app/admin/(protected)/tags/lib/api";
import { adminInputClasses } from "@/components/admin/admin-input";
import { AdminLink } from "@/components/admin/AdminLink";
import { useAdminSlice } from "@/hooks/useAdminData";
import { useMediaOptions } from "./MediaOptionsContext";

export default function TagMultiSelect({
  selectedSlugs,
  addTag,
  removeTag,
}: {
  selectedSlugs: string[];
  addTag: (slug: string) => void;
  removeTag: (slug: string) => void;
}) {
  const { tags: options } = useMediaOptions();
  const [, setTags] = useAdminSlice("mediaTags");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const labelOf = useMemo(() => {
    const map = new Map(options.map((o) => [o.slug, o.label]));
    return (slug: string) => map.get(slug) ?? slug;
  }, [options]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(selectedSlugs);
    return options
      .filter((o) => !selected.has(o.slug))
      .filter((o) => o.label.toLowerCase().includes(q) || o.slug.includes(q))
      .slice(0, 8);
  }, [query, options, selectedSlugs]);

  const querySlug = slugifyTag(query);
  const exactExists = useMemo(() => {
    if (!querySlug) return true;
    return options.some((o) => o.slug === querySlug);
  }, [options, querySlug]);

  async function createInline() {
    const label = query.trim();
    if (!label || creating) return;

    setCreating(true);
    setError("");

    try {
      const created = await createTagRequest({ label, slug: "", description: "" });
      setTags((prev) => [...prev.filter((tag) => tag.id !== created.id), created]);
      addTag(created.slug);
      setQuery("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create tag.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <label className="text-sm font-medium">Tags</label>

      {selectedSlugs.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedSlugs.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => removeTag(slug)}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              {labelOf(slug)} ×
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={adminInputClasses()}
          placeholder="Search or add a tag…"
        />

        {query.trim() ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {matches.map((o) => (
              <button
                key={o.slug}
                type="button"
                onClick={() => {
                  addTag(o.slug);
                  setQuery("");
                }}
                className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
              >
                {o.label}
              </button>
            ))}

            {!exactExists && querySlug ? (
              <button
                type="button"
                onClick={() => void createInline()}
                disabled={creating}
                className="rounded-full border border-dashed px-3 py-1 text-xs hover:bg-accent disabled:opacity-60"
              >
                {creating ? "Creating…" : `+ Create “${query.trim()}”`}
              </button>
            ) : null}

            {matches.length === 0 && exactExists ? (
              <span className="text-xs text-muted-foreground">Already added.</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <div className="text-xs text-destructive">{error}</div> : null}

      <div className="text-xs text-muted-foreground">
        Tags come from the{" "}
        <AdminLink href="/admin/tags" className="underline">
          Tags
        </AdminLink>{" "}
        taxonomy. New tags created here are added to it.
      </div>
    </div>
  );
}
