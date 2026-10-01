"use client";

import { useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import type { PageSectionsSlug, PageSectionsMap, HomeSections } from "@/lib/server/page-sections";
import type { AdminPageSections, AdminPageSeo, AdminPageSettings } from "@/lib/server/admin-pages";
import type { SectionImage } from "@/lib/page-sections-shared";
import { adminWrite } from "@/lib/client/admin-store";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import type { SeoDraft } from "./components/SeoPageForm";
import { pageNeedsImage, type PageRow } from "./lib/rows";
import { savePageParts, saveSummary, type SavePart } from "./lib/page-save";

type SettingsDraft = { isActive: boolean; cardImage: SectionImage };

function without<T>(record: Partial<Record<string, T>>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

function seoDraftOf(seo: AdminPageSeo): SeoDraft {
  return {
    title: seo.title,
    description: seo.description,
    headerTitle: seo.headerTitle,
    headerDescription: seo.headerDescription,
    ogImageUrl: seo.ogImageUrl,
  };
}

export function usePagesAdmin() {
  const [pages, setPages] = useAdminSlice("pages");
  const { settings, seo, sections } = pages;
  const setSettings = (slug: string, item: AdminPageSettings) =>
    setPages((current) => ({ ...current, settings: { ...current.settings, [slug]: item } }));
  const setSeo = (slug: string, item: AdminPageSeo) =>
    setPages((current) => ({ ...current, seo: { ...current.seo, [slug]: item } }));
  const setSections = (slug: string, item: AdminPageSections) =>
    setPages((current) => ({
      ...current,
      sections: { ...current.sections, [slug]: item.data },
      sectionsUpdatedAt: { ...current.sectionsUpdatedAt, [slug]: item.updatedAt },
    }));

  const [settingsDrafts, setSettingsDrafts] = useState<Partial<Record<string, SettingsDraft>>>({});
  const [seoDrafts, setSeoDrafts] = useState<Partial<Record<string, SeoDraft>>>({});
  const [sectionsDrafts, setSectionsDrafts] = useState<
    Partial<Record<string, PageSectionsMap[PageSectionsSlug]>>
  >({});

  const [bases, setBases] = useState<Partial<Record<string, string | null>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const { feedback, setFeedback } = useAdminAction();
  const changed = useRecordChangedDialog(() => setFeedback(null));

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

  function needsImage(row: PageRow): boolean {
    return pageNeedsImage(row, {
      isActive: isActiveOf(row),
      cardImageUrl: row.settingsSlug ? cardImageOf(row).url : undefined,
      homeSections: row.sectionsSlug === "home" ? (sectionsOf(row) as HomeSections) : undefined,
    });
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

  function rememberBase(key: string, version: string | null) {
    setBases((prev) => (key in prev ? prev : { ...prev, [key]: version }));
  }

  function setVisibilityDraft(row: PageRow, next: boolean) {
    if (!row.settingsSlug) return;
    rememberBase(`settings:${row.settingsSlug}`, settings[row.settingsSlug]!.updatedAt);
    setSettingsDrafts((prev) => ({
      ...prev,
      [row.settingsSlug!]: { ...settingsOf(row), isActive: next },
    }));
  }

  async function toggleVisibility(row: PageRow) {
    if (!row.settingsSlug || togglingSlug) return;
    const slug = row.settingsSlug;
    const previous = settings[slug]!;

    setTogglingSlug(slug);
    setSettings(slug, { ...previous, isActive: !previous.isActive });

    try {
      const res = await adminWrite(
        `/api/admin/page-settings/${slug}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !previous.isActive }),
        },
        ["pages"]
      );
      const data = (await res.json().catch(() => null)) as { item?: AdminPageSettings } | null;
      if (!res.ok || !data?.item) throw new Error();
      setSettings(slug, data.item);
    } catch {
      setSettings(slug, previous);
      setFeedback({ type: "err", text: `Could not update ${row.label}. Try again.` });
    } finally {
      setTogglingSlug(null);
    }
  }

  function setCardImageDraft(row: PageRow, image: SectionImage) {
    if (!row.settingsSlug) return;
    rememberBase(`settings:${row.settingsSlug}`, settings[row.settingsSlug]!.updatedAt);
    setSettingsDrafts((prev) => ({
      ...prev,
      [row.settingsSlug!]: { ...settingsOf(row), cardImage: image },
    }));
  }

  function setSeoField(row: PageRow, field: keyof SeoDraft, value: string) {
    if (!row.seoSlug) return;
    rememberBase(`seo:${row.seoSlug}`, seo[row.seoSlug]!.updatedAt);
    setSeoDrafts((prev) => ({ ...prev, [row.seoSlug!]: { ...seoOf(row), [field]: value } }));
  }

  function setSectionsDraft(row: PageRow, data: PageSectionsMap[PageSectionsSlug]) {
    if (!row.sectionsSlug) return;
    rememberBase(`sections:${row.sectionsSlug}`, pages.sectionsUpdatedAt[row.sectionsSlug] ?? null);
    setSectionsDrafts((prev) => ({ ...prev, [row.sectionsSlug!]: data }));
  }

  const forgetBase = (key: string) => setBases((prev) => without(prev, key));
  const clearSettingsDraft = (slug: string) => {
    setSettingsDrafts((prev) => without(prev, slug));
    forgetBase(`settings:${slug}`);
  };
  const clearSeoDraft = (slug: string) => {
    setSeoDrafts((prev) => without(prev, slug));
    forgetBase(`seo:${slug}`);
  };
  const clearSectionsDraft = (slug: string) => {
    setSectionsDrafts((prev) => without(prev, slug));
    forgetBase(`sections:${slug}`);
  };

  function discard(row: PageRow) {
    if (row.settingsSlug) clearSettingsDraft(row.settingsSlug);
    if (row.seoSlug) clearSeoDraft(row.seoSlug);
    if (row.sectionsSlug) clearSectionsDraft(row.sectionsSlug);
  }

  const baseOf = (key: string, current: string | null) => (key in bases ? (bases[key] ?? null) : current);

  function partsOf(row: PageRow): SavePart<unknown>[] {
    const parts: SavePart<never>[] = [];
    const settingsSlug = row.settingsSlug;
    if (settingsSlug && settingsDrafts[settingsSlug] !== undefined) {
      const draft = settingsDrafts[settingsSlug]!;
      parts.push({
        label: "Visibility & image",
        url: `/api/admin/page-settings/${settingsSlug}`,
        body: { isActive: draft.isActive, cardImage: draft.cardImage },
        version: baseOf(`settings:${settingsSlug}`, settings[settingsSlug]!.updatedAt),
        apply: (item: AdminPageSettings) => {
          setSettings(settingsSlug, item);
          clearSettingsDraft(settingsSlug);
        },
      });
    }
    const seoSlug = row.seoSlug;
    if (seoSlug && seoDrafts[seoSlug] !== undefined) {
      parts.push({
        label: "Search & social",
        url: `/api/admin/page-seo/${seoSlug}`,
        body: seoDrafts[seoSlug],
        version: baseOf(`seo:${seoSlug}`, seo[seoSlug]!.updatedAt),
        apply: (item: AdminPageSeo) => {
          setSeo(seoSlug, item);
          clearSeoDraft(seoSlug);
        },
      });
    }
    const sectionsSlug = row.sectionsSlug;
    if (sectionsSlug && sectionsDrafts[sectionsSlug] !== undefined) {
      parts.push({
        label: "Sections",
        url: `/api/admin/page-sections/${sectionsSlug}`,
        body: sectionsDrafts[sectionsSlug],
        version: baseOf(`sections:${sectionsSlug}`, pages.sectionsUpdatedAt[sectionsSlug] ?? null),
        apply: (item: AdminPageSections) => {
          setSections(sectionsSlug, item);
          clearSectionsDraft(sectionsSlug);
        },
      });
    }
    return parts as SavePart<unknown>[];
  }

  async function save(row: PageRow) {
    setSaving(row.key);
    setFeedback({ type: "info", text: `Saving ${row.label}…` });
    const outcomes = await savePageParts(partsOf(row), changed.ask);
    setFeedback(saveSummary(row.label, outcomes));
    setSaving(null);
  }

  return {
    saving,
    togglingSlug,
    toggleVisibility,
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
    changedDialog: changed.dialog,
  };
}
