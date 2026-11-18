"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { BackToList } from "@/components/admin/BackToList";
import { usePeopleAdmin } from "@/hooks/usePeopleAdmin";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { MediaUsageDialog } from "@/components/admin/media-usage/MediaUsageDialog";
import { PeopleList } from "./components/PeopleList";
import { PersonForm } from "./components/PersonForm";

export default function PeopleAdminClient() {
  const admin = usePeopleAdmin();
  const selection = useBulkSelection(admin.items.map((p) => p.id));

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="People"
        actions={
          admin.mode === "list" ? (
            <button
              type="button"
              disabled={admin.actionBusy}
              onClick={admin.openCreate}
              className={adminButtonClasses("default", "md")}
            >
              New profile
            </button>
          ) : (
            <BackToList onClick={admin.backToList} disabled={admin.actionBusy} />
          )
        }
      />

      <AdminActionFeedback feedback={admin.banner} />

      {admin.mode === "list" ? (
        <PeopleList
          items={admin.items}
          view={admin.view}
          searchText={admin.searchText}
          onSearchChange={admin.setSearchText}
          onSearchClear={admin.clearSearch}
          actionBusy={admin.actionBusy}
          deletingId={admin.deletingId}
          bulkBusy={admin.bulkBusy}
          selection={selection}
          onEdit={admin.openEdit}
          onDelete={(id) => void admin.remove(id)}
          onBulkDelete={admin.bulkRemove}
        />
      ) : (
        <PersonForm admin={admin} />
      )}
      <RecordChangedDialog dialog={admin.changedDialog} />
      <MediaUsageDialog dialog={admin.usageDialog} />
    </main>
  );
}
