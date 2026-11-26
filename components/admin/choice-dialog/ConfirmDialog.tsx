"use client";

import { useCallback } from "react";
import type { AdminButtonVariant } from "@/components/admin/AdminButton";
import { ChoiceDialog } from "./ChoiceDialog";
import { useChoice, type PendingChoice } from "./useChoice";

// A question before an action: the heading names the thing ("Delete “Seed Photo 36”?"), `detail` says what
// follows, `action` is the button that goes ahead (danger look unless `variant` says otherwise). Cancel, Escape
// and a tap outside answer no.
export type ConfirmQuestion = {
  heading: string;
  detail?: string;
  action: string;
  variant?: AdminButtonVariant;
  cancelLabel?: string;
};

export type AskConfirm = (question: ConfirmQuestion) => Promise<boolean>;

type ConfirmAnswer = "yes" | "no";

export type ConfirmDialogState = PendingChoice<ConfirmQuestion, ConfirmAnswer>;

export const CANNOT_UNDO = "This can't be undone.";

// deleteQuestion("“Seed Photo 36”"), deleteQuestion("3 reviews"): the plain delete question.
export function deleteQuestion(what: string, detail = CANNOT_UNDO): ConfirmQuestion {
  return { heading: `Delete ${what}?`, detail, action: "Delete" };
}

// `ask` resolves true when the action button is pressed. `asking` lets a window under the question switch off
// its own Escape, so one key press never answers both.
export function useConfirmDialog(onAsk?: () => void) {
  const { pending, ask: askChoice } = useChoice<ConfirmQuestion, ConfirmAnswer>(onAsk);
  const ask = useCallback<AskConfirm>(async (question) => (await askChoice(question)) === "yes", [askChoice]);
  return { dialog: pending, ask, asking: pending !== null };
}

export function ConfirmDialog({ dialog }: { dialog: ConfirmDialogState | null }) {
  if (!dialog) return null;
  const { heading, detail, action, variant = "danger", cancelLabel } = dialog.question;
  return (
    <ChoiceDialog<ConfirmAnswer>
      heading={heading}
      options={[{ answer: "yes", label: action, variant }]}
      onAnswer={dialog.answer}
      cancel="no"
      cancelLabel={cancelLabel}
    >
      {detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}
    </ChoiceDialog>
  );
}
