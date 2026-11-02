"use client";

import { useCallback } from "react";
import { ChoiceDialog, type ChoiceOption } from "./ChoiceDialog";
import { useChoice, type PendingChoice } from "./useChoice";

type DiscardAnswer = "discard" | "keep";

const OPTIONS: ChoiceOption<DiscardAnswer>[] = [{ answer: "discard", label: "Discard", variant: "danger" }];

export type DiscardChangesState = PendingChoice<void, DiscardAnswer>;

// Escape or a tap outside an editor window: close at once when nothing changed,
// otherwise ask first. `asking` lets the window switch off its own Escape while
// the question is up, so one key press never answers both.
export function useDiscardChanges(dirty: boolean, onClose: () => void) {
  const { pending, ask } = useChoice<void, DiscardAnswer>();

  const requestClose = useCallback(async () => {
    if (!dirty) return onClose();
    if ((await ask()) === "discard") onClose();
  }, [dirty, onClose, ask]);

  return { requestClose, asking: pending !== null, dialog: pending };
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
