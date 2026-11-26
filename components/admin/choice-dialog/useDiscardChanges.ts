"use client";

import { useCallback } from "react";
import { useConfirmDialog, type ConfirmQuestion } from "./ConfirmDialog";

const DISCARD: ConfirmQuestion = { heading: "Discard your changes?", action: "Discard", cancelLabel: "Keep editing" };

// Before leaving unsaved changes: true at once when nothing changed, otherwise the answer to
// "Discard your changes?". Render `dialog` with ConfirmDialog.
export function useConfirmDiscard(dirty: boolean) {
  const { dialog, ask, asking } = useConfirmDialog();

  const confirm = useCallback(async () => !dirty || ask(DISCARD), [dirty, ask]);

  return { confirm, asking, dialog };
}

// Escape or a tap outside an editor window: close at once when nothing changed,
// otherwise ask first. `asking` lets the window switch off its own Escape while
// the question is up, so one key press never answers both.
export function useDiscardChanges(dirty: boolean, onClose: () => void) {
  const { confirm: confirmDiscard, asking, dialog } = useConfirmDiscard(dirty);

  const requestClose = useCallback(async () => {
    if (!dirty) return onClose();
    if (await confirmDiscard()) onClose();
  }, [dirty, confirmDiscard, onClose]);

  return { requestClose, asking, dialog };
}
