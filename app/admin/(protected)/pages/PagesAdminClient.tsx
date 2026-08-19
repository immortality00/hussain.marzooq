"use client";

import type { PageSettings } from "@/lib/server/page-settings";
import type { PageSeo } from "@/lib/server/page-seo";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { PAGE_ROWS, usePagesAdmin } from "./usePagesAdmin";
import { PageRowCard } from "./components/PageRowCard";

export function PagesAdminClient({
  initialSettings,
  initialSeo,
  initialSections,
}: {
  initialSettings: PageSettings[];
  initialSeo: PageSeo[];
  initialSections: { slug: PageSectionsSlug; data: PageSectionsMap[PageSectionsSlug] }[];
}) {
  const admin = usePagesAdmin({ initialSettings, initialSeo, initialSections });
  useUnsavedChangesGuard(admin.hasUnsavedChanges);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Pages</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Control visibility, on-page content, search & social metadata, and section content for
        every public page in one place.
      </p>

      <div className="space-y-2">
        {PAGE_ROWS.map((row) => (
          <PageRowCard
            key={row.key}
            row={row}
            isOpen={admin.expanded === row.key}
            onToggleOpen={() => admin.setExpanded((prev) => (prev === row.key ? null : row.key))}
            isActive={admin.isActiveOf(row)}
            cardImage={row.settingsSlug ? admin.cardImageOf(row) : undefined}
            needsImage={admin.needsImage(row)}
            seo={row.seoSlug ? admin.seoOf(row) : EMPTY_SEO_DRAFT}
            sectionsData={row.sectionsSlug ? admin.sectionsOf(row) : undefined}
            dirty={admin.isDirty(row)}
            isSaving={admin.saving === row.key}
            feedback={admin.expanded === row.key ? admin.feedback : null}
            onVisibilityChange={(next) => admin.setVisibilityDraft(row, next)}
            onCardImageChange={(image) => admin.setCardImageDraft(row, image)}
            onSeoChange={(field, value) => admin.setSeoField(row, field, value)}
            onSectionsChange={(data) => admin.setSectionsDraft(row, data)}
            onSave={() => admin.save(row)}
            onDiscard={() => admin.discard(row)}
          />
        ))}
      </div>

      <AdminActionFeedback feedback={admin.feedback} />
    </div>
  );
}

const EMPTY_SEO_DRAFT = {
  title: "",
  description: "",
  headerTitle: "",
  headerDescription: "",
  ogImageUrl: "",
};
