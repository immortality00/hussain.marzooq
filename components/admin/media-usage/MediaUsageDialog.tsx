"use client";

import { ChoiceDialog } from "@/components/admin/choice-dialog/ChoiceDialog";
import type { MediaUsageAnswer, MediaUsageDialogState } from "./useMediaUsageDialog";

export function MediaUsageDialog({ dialog }: { dialog: MediaUsageDialogState | null }) {
  if (!dialog) return null;

  const { items, options, answer } = dialog;
  const heading = items.length === 1 ? "This photo is used in:" : "These photos are used in:";

  return (
    <ChoiceDialog<MediaUsageAnswer> heading={heading} options={options} onAnswer={answer} cancel="cancel">
      <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <p className="font-medium">{item.title}</p>
            <p className="text-muted-foreground">{item.usedOn.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </ChoiceDialog>
  );
}
