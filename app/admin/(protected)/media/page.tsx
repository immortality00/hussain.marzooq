"use client";

import Link from "next/link";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import MediaWizard from "./components/MediaWizard";
import { useMediaEditorController } from "./lib/useMediaEditorController";

export default function AdminMediaPage() {
  const { editor, busy, busyAction, banner, save, remove, startNewUpload } =
    useMediaEditorController();

  return (
    <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title={editor.editingId ? "Edit Media" : "Upload Media"}
        actions={
          <>
            <Link href="/admin/media/list" className={adminButtonClasses("default", "md")}>
              View list
            </Link>

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
    </main>
  );
}