"use client";

import { useCallback } from "react";
import { ChoiceDialog, type ChoiceOption } from "./ChoiceDialog";
import { useChoice, type PendingChoice } from "./useChoice";

type DiscardAnswer = "discard" | "keep";

const OPTIONS: ChoiceOption<DiscardAnswer>[] = [{ answer: "discard", label: "Discard", variant: "danger" }];

export type DiscardChangesState = PendingChoice<void, DiscardAnswer>;

// Before leaving unsaved changes: true at once when nothing changed, otherwise
// the answer to "Discard your changes?".
export function useConfirmDiscard(dirty: boolean) {
  const { pending, ask } = useChoice<void, DiscardAnswer>();

  const confirm = useCallback(async () => !dirty || (await ask()) === "discard", [dirty, ask]);

  return { confirm, asking: pending !== null, dialog: pending };
}

// Escape or a tap outside an editor window: close at once when nothing changed,
// otherwise ask first. `asking` lets the window switch off its own Escape while
// the question is up, so one key press never answers both.
export function useDiscardChanges(dirty: boolean, onClose: () => void) {
  const { confirm, asking, dialog } = useConfirmDiscard(dirty);

  const requestClose = useCallback(async () => {
    if (!dirty) return onClose();
    if (await confirm()) onClose();
  }, [dirty, confirm, onClose]);

  return { requestClose, asking, dialog };
}

export function DiscardChangesDialog({ dialog }: { dialog: DiscardChangesState | null }) {
  if (!dialog) return null;
  return (
    <ChoiceDialog<DiscardAnswer>
      heading="Discard your changes?"
      options={OPTIONS}
      onAnswer={dialog.answer}
      cancel="keep"
      cancelLabel="Keep editing"
    />
  );
}
