"use client";

import { useState } from "react";
import type { PageSettings } from "@/lib/server/page-settings";
import type { PageSeo } from "@/lib/server/page-seo";
import type { PageSectionsSlug, PageSectionsMap, HomeSections } from "@/lib/server/page-sections";
import type { SectionImage } from "@/lib/page-sections-shared";
import { useAdminAction } from "@/hooks/useAdminAction";
import type { SeoDraft } from "./components/SeoPageForm";

type SettingsDraft = { isActive: boolean; cardImage: SectionImage };

export type PageRow = {
  key: string;
  label: string;
  settingsSlug?: string;
  seoSlug?: string;
  // Dynamic detail pages: the on-page header is the record's own data (edited
  // in its own admin section), so only the search & social group is shown, and
  // the {name} placeholder hint applies.
  seoDetailPage?: boolean;
  sectionsSlug?: PageSectionsSlug;
};

export const PAGE_ROWS: PageRow[] = [
  { key: "home", label: "Home", seoSlug: "home", sectionsSlug: "home" },
  { key: "about", label: "About", seoSlug: "about", sectionsSlug: "about" },
  {
    key: "photography",
    label: "Photography",
    settingsSlug: "photography",
    seoSlug: "photography",
    sectionsSlug: "photography",
  },
  {
    key: "photography-tag",
    label: "Photography — tag page",
    seoSlug: "photography-tag",
    seoDetailPage: true,
  },
  {
    key: "videography",
    label: "Videography",
    settingsSlug: "videography",
    seoSlug: "videography",
    sectionsSlug: "videography",
  },
  {
    key: "videography-tag",
    label: "Videography — tag page",
    seoSlug: "videography-tag",
    seoDetailPage: true,
  },
  { key: "nft", label: "NFT", settingsSlug: "nft", seoSlug: "nft", sectionsSlug: "nft" },
  { key: "dancing", label: "Dancing", settingsSlug: "dancing", seoSlug: "dancing", sectionsSlug: "dancing" },
  {
    key: "web-development",
    label: "Web Development",
    settingsSlug: "web-development",
    seoSlug: "web-development",
    sectionsSlug: "web-development",
  },
  { key: "services", label: "Services", seoSlug: "services" },
  { key: "people", label: "People", seoSlug: "people", sectionsSlug: "people" },
  {
    key: "people-detail",
    label: "People — detail page",
    seoSlug: "people-detail",
    seoDetailPage: true,
    sectionsSlug: "people-detail",
  },
  { key: "blog", label: "Blog", seoSlug: "blog", sectionsSlug: "blog" },
  { key: "contact", label: "Contact", seoSlug: "contact" },
  { key: "testimonials", label: "Testimonials", seoSlug: "testimonials", sectionsSlug: "testimonials" },
];

function seoDraftOf(seo: PageSeo): SeoDraft {
  return {
    title: seo.title,
    description: seo.description,
    headerTitle: seo.headerTitle,
    headerDescription: seo.headerDescription,
    ogImageUrl: seo.ogImageUrl,
  };
}

export function usePagesAdmin({
  initialSettings,
  initialSeo,
  initialSections,
}: {
  initialSettings: PageSettings[];
  initialSeo: PageSeo[];
  initialSections: { slug: PageSectionsSlug; data: PageSectionsMap[PageSectionsSlug] }[];
}) {
  const [settings, setSettings] = useState<Record<string, PageSettings>>(
    Object.fromEntries(initialSettings.map((s) => [s.slug, s])),
  );
  const [seo, setSeo] = useState<Record<string, PageSeo>>(
    Object.fromEntries(initialSeo.map((s) => [s.slug, s])),
  );
  const [sections, setSections] = useState<Record<string, PageSectionsMap[PageSectionsSlug]>>(
    Object.fromEntries(initialSections.map((s) => [s.slug, s.data])),
  );

  const [settingsDrafts, setSettingsDrafts] = useState<Partial<Record<string, SettingsDraft>>>({});
  const [seoDrafts, setSeoDrafts] = useState<Partial<Record<string, SeoDraft>>>({});
  const [sectionsDrafts, setSectionsDrafts] = useState<
    Partial<Record<string, PageSectionsMap[PageSectionsSlug]>>
  >({});

  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const { feedback, setFeedback } = useAdminAction();

  const hasUnsavedChanges =
    Object.keys(settingsDrafts).length > 0 ||
    Object.keys(seoDrafts).length > 0 ||
    Object.keys(sectionsDrafts).length > 0;

  function settingsOf(row: PageRow): SettingsDraft {
    if (!row.settingsSlug) throw new Error(`Row ${row.key} has no settings slug`);
    const current = settings[row.settingsSlug]!;
    return (
      settingsDrafts[row.settingsSlug] ?? {
        isActive: current.isActive,
        cardImage: current.cardImage,
      }
    );
  }

  function isActiveOf(row: PageRow): boolean {
    if (!row.settingsSlug) return true;
    return settingsOf(row).isActive;
  }

  function cardImageOf(row: PageRow): SectionImage {
    return settingsOf(row).cardImage;
  }

  // Row-level "Needs image" flag — true whenever any image warning inside the
  // row would fire, so the pill and the inline notes stay in lockstep:
  //  • a visible discipline with no Work-overlay card image, and
  //  • the homepage hero or any Featured Work card left imageless.
  // "Empty means empty" is upheld everywhere — this only warns, never auto-picks.
  function needsImage(row: PageRow): boolean {
    if (row.settingsSlug && isActiveOf(row) && !cardImageOf(row).url) return true;
    if (row.sectionsSlug === "home") {
      const home = sectionsOf(row) as HomeSections;
      if (!home.hero?.image?.url) return true;
      if (home.featuredCards.some((card) => !card.image?.url)) return true;
    }
    return false;
  }

  function seoOf(row: PageRow): SeoDraft {
    if (!row.seoSlug) throw new Error(`Row ${row.key} has no seo slug`);
    return seoDrafts[row.seoSlug] ?? seoDraftOf(seo[row.seoSlug]!);
  }

  function sectionsOf(row: PageRow): PageSectionsMap[PageSectionsSlug] {
    if (!row.sectionsSlug) throw new Error(`Row ${row.key} has no sections slug`);
    return sectionsDrafts[row.sectionsSlug] ?? sections[row.sectionsSlug]!;
  }

  function isDirty(row: PageRow): boolean {
    return Boolean(
      (row.settingsSlug && settingsDrafts[row.settingsSlug] !== undefined) ||
        (row.seoSlug && seoDrafts[row.seoSlug] !== undefined) ||
        (row.sectionsSlug && sectionsDrafts[row.sectionsSlug] !== undefined),
    );
  }

  function setVisibilityDraft(row: PageRow, next: boolean) {
    if (!row.settingsSlug) return;
    setSettingsDrafts((prev) => ({
      ...prev,
      [row.settingsSlug!]: { ...settingsOf(row), isActive: next },
    }));
  }

  function setCardImageDraft(row: PageRow, image: SectionImage) {
    if (!row.settingsSlug) return;
    setSettingsDrafts((prev) => ({
      ...prev,
      [row.settingsSlug!]: { ...settingsOf(row), cardImage: image },
    }));
  }

  function setSeoField(row: PageRow, field: keyof SeoDraft, value: string) {
    if (!row.seoSlug) return;
    setSeoDrafts((prev) => ({ ...prev, [row.seoSlug!]: { ...seoOf(row), [field]: value } }));
  }

  function setSectionsDraft(row: PageRow, data: PageSectionsMap[PageSectionsSlug]) {
    if (!row.sectionsSlug) return;
    setSectionsDrafts((prev) => ({ ...prev, [row.sectionsSlug!]: data }));
  }

  function clearSettingsDraft(slug: string) {
    setSettingsDrafts((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }

  function clearSeoDraft(slug: string) {
    setSeoDrafts((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }

  function clearSectionsDraft(slug: string) {
    setSectionsDrafts((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }

  function discard(row: PageRow) {
    if (row.settingsSlug) clearSettingsDraft(row.settingsSlug);
    if (row.seoSlug) clearSeoDraft(row.seoSlug);
    if (row.sectionsSlug) clearSectionsDraft(row.sectionsSlug);
  }

  async function save(row: PageRow) {
    setSaving(row.key);
    setFeedback({ type: "info", text: `Saving ${row.label}…` });

    type Part = { label: string; run: () => Promise<void> };
    const parts: Part[] = [];

    if (row.settingsSlug && settingsDrafts[row.settingsSlug] !== undefined) {
      const slug = row.settingsSlug;
      const draft = settingsDrafts[slug]!;
      parts.push({
        label: "Visibility & image",
        run: async () => {
          const res = await fetch(`/api/admin/page-settings/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: draft.isActive, cardImage: draft.cardImage }),
          });
          if (!res.ok) throw new Error();
          setSettings((prev) => ({
            ...prev,
            [slug]: { ...prev[slug]!, isActive: draft.isActive, cardImage: draft.cardImage },
          }));
          clearSettingsDraft(slug);
        },
      });
    }

    if (row.seoSlug && seoDrafts[row.seoSlug] !== undefined) {
      const slug = row.seoSlug;
      const draft = seoDrafts[slug]!;
      parts.push({
        label: "Search & social",
        run: async () => {
          const res = await fetch(`/api/admin/page-seo/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error();
          setSeo((prev) => ({
            ...prev,
            [slug]: { ...prev[slug]!, ...draft, updatedAt: new Date() },
          }));
          clearSeoDraft(slug);
        },
      });
    }

    if (row.sectionsSlug && sectionsDrafts[row.sectionsSlug] !== undefined) {
      const slug = row.sectionsSlug;
      const draft = sectionsDrafts[slug]!;
      parts.push({
        label: "Sections",
        run: async () => {
          const res = await fetch(`/api/admin/page-sections/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error();
          setSections((prev) => ({ ...prev, [slug]: draft }));
          clearSectionsDraft(slug);
        },
      });
    }

    const results = await Promise.allSettled(parts.map((p) => p.run()));
    const saved = parts.filter((_, i) => results[i]!.status === "fulfilled").map((p) => p.label);
    const failed = parts.filter((_, i) => results[i]!.status === "rejected").map((p) => p.label);

    if (failed.length === 0) {
      setFeedback({
        type: "ok",
        text:
          parts.length > 1
            ? `${row.label} saved — ${saved.join(", ")}.`
            : `${row.label} saved.`,
      });
    } else if (saved.length === 0) {
      setFeedback({
        type: "err",
        text: `${row.label} not saved — ${failed.join(", ")} failed. Try again.`,
      });
    } else {
      setFeedback({
        type: "err",
        text: `${row.label}: saved ${saved.join(", ")}; ${failed.join(", ")} failed. Try again.`,
      });
    }

    setSaving(null);
  }

  return {
    expanded,
    setExpanded,
    saving,
    feedback,
    hasUnsavedChanges,
    isActiveOf,
    cardImageOf,
    needsImage,
    seoOf,
    sectionsOf,
    isDirty,
    setVisibilityDraft,
    setCardImageDraft,
    setSeoField,
    setSectionsDraft,
    discard,
    save,
  };
}
