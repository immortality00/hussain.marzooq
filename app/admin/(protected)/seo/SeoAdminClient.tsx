"use client";

import { useState } from "react";
import type { PageSeo } from "@/lib/server/page-seo";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";

const LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  photography: "Photography",
  videography: "Videography",
  nft: "NFT",
  dancing: "Dancing",
  "web-development": "Web Development",
  contact: "Contact / Book",
  services: "Services",
  people: "People",
  blog: "Blog",
  testimonials: "Testimonials",
};

type Draft = { title: string; description: string; ogImageUrl: string };

export function SeoAdminClient({ initialPages }: { initialPages: PageSeo[] }) {
  const [pages, setPages] = useState(initialPages);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [feedback, setFeedback] = useState<AdminActionFeedbackState>(null);
  const [saving, setSaving] = useState<string | null>(null);

  function getDraft(page: PageSeo): Draft {
    return drafts[page.slug] ?? {
      title: page.title,
      description: page.description,
      ogImageUrl: page.ogImageUrl,
    };
  }

  function setDraft(slug: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: { ...getDraft(pages.find((p) => p.slug === slug)!), [field]: value },
    }));
  }

  function toggle(slug: string) {
    setExpanded((prev) => (prev === slug ? null : slug));
  }

  async function save(slug: string) {
    const page = pages.find((p) => p.slug === slug)!;
    const draft = getDraft(page);
    setSaving(slug);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/page-seo/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Request failed");
      setPages((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, ...draft, updatedAt: new Date() } : p,
        ),
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      setFeedback({ type: "ok", text: `${LABELS[slug]} SEO updated.` });
    } catch {
      setFeedback({ type: "err", text: "Failed to save. Try again." });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Page SEO</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Control the title and description shown in search results and social link previews for each public page.
      </p>

      <div className="space-y-2">
        {pages.map((page) => {
          const isOpen = expanded === page.slug;
          const draft = getDraft(page);
          const isDirty =
            draft.title !== page.title ||
            draft.description !== page.description ||
            draft.ogImageUrl !== page.ogImageUrl;

          return (
            <div key={page.slug} className="rounded-2xl border">
              <button
                type="button"
                onClick={() => toggle(page.slug)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{LABELS[page.slug]}</p>
                  <p className="mt-0.5 max-w-lg truncate text-xs text-muted-foreground">
                    {page.title}
                  </p>
                </div>
                <span className="ml-4 shrink-0 text-muted-foreground">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Page title
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft(page.slug, "title", e.target.value)}
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
                        onChange={(e) => setDraft(page.slug, "description", e.target.value)}
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
                        onChange={(e) => setDraft(page.slug, "ogImageUrl", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={!isDirty || saving === page.slug}
                      onClick={() => save(page.slug)}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                    >
                      {saving === page.slug ? "Saving…" : "Save"}
                    </button>
                    {isDirty && (
                      <button
                        type="button"
                        onClick={() =>
                          setDrafts((prev) => {
                            const next = { ...prev };
                            delete next[page.slug];
                            return next;
                          })
                        }
                        className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent/40"
                      >
                        Discard
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AdminActionFeedback feedback={feedback} />
    </div>
  );
}
