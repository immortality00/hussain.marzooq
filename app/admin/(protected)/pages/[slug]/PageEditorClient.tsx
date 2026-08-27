"use client";

import Link from "next/link";
import type { PageSettings } from "@/lib/server/page-settings";
import type { PageSeo } from "@/lib/server/page-seo";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { usePagesAdmin } from "../usePagesAdmin";
import { PAGE_ROWS } from "../lib/rows";
import { PageEditorBody } from "../components/PageEditorBody";

const EMPTY_SEO_DRAFT = {
  title: "",
  description: "",
  headerTitle: "",
  headerDescription: "",
  ogImageUrl: "",
};

export function PageEditorClient({
  slug,
  initialSettings,
  initialSeo,
  initialSections,
}: {
  slug: string;
  initialSettings: PageSettings[];
  initialSeo: PageSeo[];
  initialSections: { slug: PageSectionsSlug; data: PageSectionsMap[PageSectionsSlug] }[];
}) {
  const admin = usePagesAdmin({ initialSettings, initialSeo, initialSections });
  useUnsavedChangesGuard(admin.hasUnsavedChanges);

  const row = PAGE_ROWS.find((r) => r.key === slug)!;

  return (
    <div>
      <Link
        href="/admin/pages"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All pages
      </Link>

      <AdminPageHeader title={row.label} className="mb-6 mt-3" />

      <PageEditorBody
        row={row}
        isActive={admin.isActiveOf(row)}
        cardImage={row.settingsSlug ? admin.cardImageOf(row) : undefined}
        seo={row.seoSlug ? admin.seoOf(row) : EMPTY_SEO_DRAFT}
        sectionsData={row.sectionsSlug ? admin.sectionsOf(row) : undefined}
        dirty={admin.isDirty(row)}
        isSaving={admin.saving === row.key}
        feedback={admin.feedback}
        onVisibilityChange={(next) => admin.setVisibilityDraft(row, next)}
        onCardImageChange={(image) => admin.setCardImageDraft(row, image)}
        onSeoChange={(field, value) => admin.setSeoField(row, field, value)}
        onSectionsChange={(data) => admin.setSectionsDraft(row, data)}
        onSave={() => admin.save(row)}
        onDiscard={() => admin.discard(row)}
      />
    </div>
  );
}
