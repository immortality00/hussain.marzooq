"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackToList } from "@/components/admin/BackToList";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { usePagesAdmin } from "../usePagesAdmin";
import { PAGE_ROWS } from "../lib/rows";
import { PageEditorBody } from "../components/PageEditorBody";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { ConfirmDialog } from "@/components/admin/choice-dialog/ConfirmDialog";

const EMPTY_SEO_DRAFT = {
  title: "",
  description: "",
  headerTitle: "",
  headerDescription: "",
  ogImageUrl: "",
};

export function PageEditorClient({ slug }: { slug: string }) {
  const admin = usePagesAdmin();
  const leaveDialog = useUnsavedChangesGuard(admin.hasUnsavedChanges);

  const row = PAGE_ROWS.find((r) => r.key === slug)!;

  return (
    <div>
      <AdminPageHeader title={row.label} className="mb-6" actions={<BackToList href="/admin/pages" />} />

      <PageEditorBody
        row={row}
        isActive={admin.isActiveOf(row)}
        seo={row.seoSlug ? admin.seoOf(row) : EMPTY_SEO_DRAFT}
        sectionsData={row.sectionsSlug ? admin.sectionsOf(row) : undefined}
        dirty={admin.isDirty(row)}
        isSaving={admin.saving === row.key}
        feedback={admin.feedback}
        onVisibilityChange={(next) => admin.setVisibilityDraft(row, next)}
        onSeoChange={(field, value) => admin.setSeoField(row, field, value)}
        onSectionsChange={(data) => admin.setSectionsDraft(row, data)}
        onSave={() => admin.save(row)}
        onDiscard={() => admin.discard(row)}
      />
      <RecordChangedDialog dialog={admin.changedDialog} />
      <ConfirmDialog dialog={leaveDialog} />
    </div>
  );
}
