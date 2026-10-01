"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { refreshAdminData } from "@/lib/client/admin-store";
import TagFormCard from "./components/TagFormCard";
import TagsTable from "./components/TagsTable";
import TagsToolbar from "./components/TagsToolbar";
import { useTagActions } from "./lib/useTagActions";

export default function AdminTagsClient() {
  const tags = useTagActions();
  const { selection } = tags;

  return (
    <div>
      <TagsToolbar savingOrder={tags.savingOrder} onSaveOrder={tags.saveOrder} />

      <AdminActionFeedback feedback={tags.feedback} />

      <TagFormCard draft={tags.draft} setDraft={tags.setDraft} onCreate={tags.createTag} creating={tags.creating} />

      {tags.ordered.length > 0 && (
        <div className="mt-6 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selection.allSelected}
            indeterminate={selection.count > 0 && !selection.allSelected}
            onChange={selection.toggleAll}
            label="Select all tags"
          />
          Select all
        </div>
      )}

      <TagsTable
        ordered={tags.ordered}
        isSelected={selection.isSelected}
        onToggleSelect={selection.toggle}
        onReorder={tags.onReorder}
        onEdit={tags.editTag}
        onToggle={tags.toggleTag}
        onDelete={tags.deleteTag}
      />

      <BulkActionBar
        count={selection.count}
        busy={tags.bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Activate", onRun: () => tags.bulkSetActive(true) },
          { label: "Deactivate", onRun: () => tags.bulkSetActive(false) },
          { label: "Delete", tone: "danger", onRun: tags.bulkDelete },
        ]}
      />

      <div className="mt-6">
        <button
          type="button"
          disabled={tags.actionBusy}
          onClick={() => void refreshAdminData()}
          className={adminButtonClasses("default", "md")}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
