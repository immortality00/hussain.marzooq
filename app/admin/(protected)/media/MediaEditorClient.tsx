"use client";

import { AdminLink } from "@/components/admin/AdminLink";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { MediaUsageDialog } from "@/components/admin/media-usage/MediaUsageDialog";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import MediaWizard from "./components/MediaWizard";
import { useMediaEditorController } from "./lib/useMediaEditorController";
import type { MediaItem } from "./lib/types";

export default function MediaEditorClient({
  initialItem,
  loadError,
}: {
  initialItem: MediaItem | null;
  loadError: string | null;
}) {
  const {
    editor,
    busy,
    busyAction,
    banner,
    usageDialog,
    changedDialog,
    navigationCover,
    save,
    remove,
    startNewUpload,
  } = useMediaEditorController({ initialItem, loadError });

  return (
    <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title={editor.editingId ? "Edit Media" : "Upload Media"}
        actions={
          <>
            <AdminLink href="/admin/media/list" className={adminButtonClasses("default", "md")}>
              View list
            </AdminLink>

            {editor.editingId ? (
              <button
                type="button"
                onClick={startNewUpload}
                disabled={busy}
                className={adminButtonClasses("default", "md")}
              >
                New upload
              </button>
            ) : null}
          </>
        }
      />

      <AdminActionFeedback feedback={banner} />

      <MediaWizard
        editor={editor}
        busy={busy}
        busyAction={busyAction}
        save={save}
        remove={remove}
      />

      <MediaUsageDialog dialog={usageDialog} />
      <RecordChangedDialog dialog={changedDialog} />
      {navigationCover}
    </main>
  );
}