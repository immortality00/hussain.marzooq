"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GalleryList } from "@/components/admin/private-galleries/GalleryList";
import { GalleryWizard } from "@/components/admin/private-galleries/GalleryWizard";
import { usePrivateGalleriesAdmin } from "@/components/admin/private-galleries/usePrivateGalleriesAdmin";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export default function PrivateGalleriesAdminClient() {
  const admin = usePrivateGalleriesAdmin();
  const selection = useBulkSelection(admin.items.map((g) => g.id));

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="Private Galleries"
        actions={
          admin.view === "list" ? (
            <button
              type="button"
              onClick={admin.openNew}
              disabled={admin.actionBusy}
              className={adminButtonClasses("default", "md")}
            >
              New gallery
            </button>
          ) : (
            <button
              type="button"
              onClick={admin.backToList}
              disabled={admin.actionBusy}
              className={adminButtonClasses("default", "md")}
            >
              Back to list
            </button>
          )
        }
      />

      <AdminActionFeedback feedback={admin.banner} />

      {admin.view === "list" ? (
        <>
        <GalleryList
          items={admin.items}
          loading={admin.loading}
          searchValue={admin.gallerySearchValue}
          deletingId={admin.deletingId}
          onSearchChange={admin.setGallerySearchValue}
          onSearchClear={admin.clearGallerySearch}
          onCopyLink={(slug) => void admin.copyLink(slug)}
          onEdit={(id) => void admin.openEdit(id)}
          onDelete={(id) => void admin.remove(id)}
          isSelected={selection.isSelected}
          onToggleSelect={selection.toggle}
          selectAll={{
            checked: selection.allSelected,
            indeterminate: selection.count > 0 && !selection.allSelected,
            onChange: selection.toggleAll,
          }}
        />
        <BulkActionBar
          count={selection.count}
          busy={admin.bulkBusy}
          onClear={selection.clear}
          actions={[
            {
              label: "Delete",
              tone: "danger",
              onRun: async () => {
                await admin.bulkRemove(selection.selectedIds);
                selection.clear();
              },
            },
          ]}
        />
        </>
      ) : (
        <GalleryWizard admin={admin} />
      )}
    </main>
  );
}