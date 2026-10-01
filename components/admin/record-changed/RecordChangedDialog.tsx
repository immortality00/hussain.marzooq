"use client";

import { useCallback } from "react";
import { ChoiceDialog, type ChoiceOption } from "@/components/admin/choice-dialog/ChoiceDialog";
import { useChoice, type PendingChoice } from "@/components/admin/choice-dialog/useChoice";
import type { RecordChangedAnswer } from "@/lib/record-changed";

const OPTIONS: ChoiceOption<RecordChangedAnswer>[] = [
  { answer: "reload", label: "Load the newer version" },
  { answer: "overwrite", label: "Save mine over it", variant: "solid" },
];

export type RecordChangedDialogState = PendingChoice<void, RecordChangedAnswer>;

export function useRecordChangedDialog(onAsk?: () => void) {
  const { pending, ask } = useChoice<void, RecordChangedAnswer>(onAsk);
  return { dialog: pending, ask: useCallback(() => ask(), [ask]) };
}

export function RecordChangedDialog({ dialog }: { dialog: RecordChangedDialogState | null }) {
  if (!dialog) return null;
  return (
    <ChoiceDialog<RecordChangedAnswer>
      heading="Changed on another device since you opened it."
      options={OPTIONS}
      onAnswer={dialog.answer}
      cancel="cancel"
    />
  );
}
