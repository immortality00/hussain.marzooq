"use client";

import { useState } from "react";
import type { PageSettings } from "@/lib/server/page-settings";
import type { PageSeo } from "@/lib/server/page-seo";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { useAdminAction } from "@/hooks/useAdminAction";
import type { SeoDraft } from "./components/SeoPageForm";

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
    key: "videography",
    label: "Videography",
    settingsSlug: "videography",
    seoSlug: "videography",
    sectionsSlug: "videography",
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

  const [settingsDrafts, setSettingsDrafts] = useState<Partial<Record<string, boolean>>>({});
  const [seoDrafts, setSeoDrafts] = useState<Partial<Record<string, SeoDraft>>>({});
  const [sectionsDrafts, setSectionsDrafts] = useState<
    Partial<Record<string, PageSectionsMap[PageSectionsSlug]>>
  >({});

  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const { feedback, run } = useAdminAction();

  function isActiveOf(row: PageRow): boolean {
    if (!row.settingsSlug) return true;
    return settingsDrafts[row.settingsSlug] ?? settings[row.settingsSlug]!.isActive;
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
    setSettingsDrafts((prev) => ({ ...prev, [row.settingsSlug!]: next }));
  }

  function setSeoField(row: PageRow, field: keyof SeoDraft, value: string) {
    if (!row.seoSlug) return;
    setSeoDrafts((prev) => ({ ...prev, [row.seoSlug!]: { ...seoOf(row), [field]: value } }));
  }

  function setSectionsDraft(row: PageRow, data: PageSectionsMap[PageSectionsSlug]) {
    if (!row.sectionsSlug) return;
    setSectionsDrafts((prev) => ({ ...prev, [row.sectionsSlug!]: data }));
  }

  function discard(row: PageRow) {
    if (row.settingsSlug) {
      setSettingsDrafts((prev) => {
        const next = { ...prev };
        delete next[row.settingsSlug!];
        return next;
      });
    }
    if (row.seoSlug) {
      setSeoDrafts((prev) => {
        const next = { ...prev };
        delete next[row.seoSlug!];
        return next;
      });
    }
    if (row.sectionsSlug) {
      setSectionsDrafts((prev) => {
        const next = { ...prev };
        delete next[row.sectionsSlug!];
        return next;
      });
    }
  }

  async function save(row: PageRow) {
    setSaving(row.key);
    await run(
      async () => {
        const tasks: Promise<void>[] = [];

        if (row.settingsSlug && settingsDrafts[row.settingsSlug] !== undefined) {
          const nextActive = settingsDrafts[row.settingsSlug]!;
          tasks.push(
            fetch(`/api/admin/page-settings/${row.settingsSlug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: nextActive }),
            }).then((res) => {
              if (!res.ok) throw new Error("Failed to save. Try again.");
              setSettings((prev) => ({
                ...prev,
                [row.settingsSlug!]: { ...prev[row.settingsSlug!]!, isActive: nextActive },
              }));
            }),
          );
        }

        if (row.seoSlug && seoDrafts[row.seoSlug] !== undefined) {
          const draft = seoDrafts[row.seoSlug]!;
          tasks.push(
            fetch(`/api/admin/page-seo/${row.seoSlug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(draft),
            }).then((res) => {
              if (!res.ok) throw new Error("Failed to save. Try again.");
              setSeo((prev) => ({
                ...prev,
                [row.seoSlug!]: { ...prev[row.seoSlug!]!, ...draft, updatedAt: new Date() },
              }));
            }),
          );
        }

        if (row.sectionsSlug && sectionsDrafts[row.sectionsSlug] !== undefined) {
          const draft = sectionsDrafts[row.sectionsSlug]!;
          tasks.push(
            fetch(`/api/admin/page-sections/${row.sectionsSlug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(draft),
            }).then((res) => {
              if (!res.ok) throw new Error("Failed to save. Try again.");
              setSections((prev) => ({ ...prev, [row.sectionsSlug!]: draft }));
            }),
          );
        }

        await Promise.all(tasks);
        discard(row);
      },
      { successText: `${row.label} updated.` },
    );
    setSaving(null);
  }

  return {
    expanded,
    setExpanded,
    saving,
    feedback,
    isActiveOf,
    seoOf,
    sectionsOf,
    isDirty,
    setVisibilityDraft,
    setSeoField,
    setSectionsDraft,
    discard,
    save,
  };
}
