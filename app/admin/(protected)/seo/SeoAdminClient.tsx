"use client";

import { useState } from "react";
import type { PageSeo } from "@/lib/server/page-seo";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { SeoPageForm, type SeoDraft } from "./components/SeoPageForm";

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

export function SeoAdminClient({ initialPages }: { initialPages: PageSeo[] }) {
  const [pages, setPages] = useState(initialPages);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, SeoDraft>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { feedback, setFeedback, run } = useAdminAction();

  function getDraft(page: PageSeo): SeoDraft {
    return (
      drafts[page.slug] ?? {
        title: page.title,
        description: page.description,
        headerTitle: page.headerTitle,
        headerDescription: page.headerDescription,
        ogImageUrl: page.ogImageUrl,
      }
    );
  }

  function setDraft(slug: string, field: keyof SeoDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: { ...getDraft(pages.find((p) => p.slug === slug)!), [field]: value },
    }));
  }

  function toggle(slug: string) {
    setExpanded((prev) => (prev === slug ? null : slug));
  }

  function discard(slug: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }

  async function save(slug: string) {
    const page = pages.find((p) => p.slug === slug)!;
    const draft = getDraft(page);
    setSaving(slug);
    await run(
      async () => {
        const res = await fetch(`/api/admin/page-seo/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) throw new Error("Failed to save. Try again.");
        setPages((prev) =>
          prev.map((p) =>
            p.slug === slug ? { ...p, ...draft, updatedAt: new Date() } : p,
          ),
        );
        discard(slug);
      },
      { successText: `${LABELS[slug]} content updated.` },
    );
    setSaving(null);
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Page Content</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Control the heading and description visitors see on each public page, plus the title and description search engines and social previews see.
      </p>

      <div className="space-y-2">
        {pages.map((page) => {
          const isOpen = expanded === page.slug;
          const draft = getDraft(page);
          const isDirty =
            draft.title !== page.title ||
            draft.description !== page.description ||
            draft.headerTitle !== page.headerTitle ||
            draft.headerDescription !== page.headerDescription ||
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
                    {page.headerTitle}
                  </p>
                </div>
                <span className="ml-4 shrink-0 text-muted-foreground">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <SeoPageForm
                  page={page}
                  draft={draft}
                  isDirty={isDirty}
                  isSaving={saving === page.slug}
                  onChange={(field, value) => setDraft(page.slug, field, value)}
                  onSave={() => save(page.slug)}
                  onDiscard={() => discard(page.slug)}
                />
              )}
            </div>
          );
        })}
      </div>

      <AdminActionFeedback feedback={feedback} />
    </div>
  );
}
