"use client";

import { useEffect, useRef, useState } from "react";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { BackToList } from "@/components/admin/BackToList";
import { DiscardChangesDialog, useConfirmDiscard } from "@/components/admin/choice-dialog/DiscardChangesDialog";
import { MediaUsageDialog } from "@/components/admin/media-usage/MediaUsageDialog";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { useBackToList } from "@/hooks/useBackToList";
import { returnToRow } from "@/lib/client/list-return";
import MediaWizard from "./components/MediaWizard";
import { MediaItemNav } from "./components/MediaItemNav";
import { MEDIA_LIST, mediaListHref } from "./lib/media-list-address";
import { shownMediaView } from "./lib/media-page-sets";
import { useMediaEditorController } from "./lib/useMediaEditorController";
import { useMediaItemNav } from "./lib/useMediaItemNav";
import type { MediaItem } from "./lib/types";

export default function MediaEditorClient({
  initialItem,
  loadError,
  step,
  onStep,
  openItem,
}: {
  initialItem: MediaItem | null;
  loadError: string | null;
  step: number;
  onStep: (step: number) => void;
  openItem: (id: string) => void;
}) {
  // The list view this item was opened from: its way back and its Previous / Next item.
  const [view] = useState(shownMediaView);
  const listHref = mediaListHref(view);
  const back = useBackToList(listHref);
  const neighbour = useRef<string | null>(null);

  const controller = useMediaEditorController({
    initialItem,
    loadError,
    onDeleted: () => {
      returnToRow(MEDIA_LIST, neighbour.current);
      back.goBack();
    },
  });
  const { editor, dirty, busy, busyAction, banner, setBanner, usageDialog, changedDialog, navigationCover } =
    controller;

  const nav = useMediaItemNav(initialItem?.id ?? "", view, openItem, (text) => setBanner({ type: "err", text }));
  useEffect(() => {
    neighbour.current = nav.neighbour;
  });

  const discard = useConfirmDiscard(dirty);

  async function leaveFor(go: () => void | Promise<void>) {
    if (await discard.confirm()) await go();
  }

  return (
    <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title={editor.editingId ? "Edit media" : "Upload media"}
        actions={
          <>
            <BackToList href={listHref} beforeLeave={discard.confirm} disabled={busy} />

            {editor.editingId && nav.shown ? (
              <MediaItemNav
                hasPrevious={Boolean(nav.previous)}
                hasNext={nav.hasNext}
                loading={nav.loading}
                disabled={busy}
                onPrevious={() => void leaveFor(nav.goPrevious)}
                onNext={() => void leaveFor(nav.goNext)}
              />
            ) : null}

            {editor.editingId ? (
              <button
                type="button"
                onClick={controller.startNewUpload}
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
        save={controller.save}
        remove={controller.remove}
        step={step}
        onStep={onStep}
      />

      <MediaUsageDialog dialog={usageDialog} />
      <RecordChangedDialog dialog={changedDialog} />
      <DiscardChangesDialog dialog={discard.dialog} />
      {navigationCover}
      {back.navigationCover}
    </main>
  );
}
