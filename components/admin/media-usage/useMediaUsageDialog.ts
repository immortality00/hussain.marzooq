"use client";

import { useCallback, useState } from "react";
import type { AdminButtonVariant } from "@/components/admin/AdminButton";
import type { MediaInUse } from "@/lib/media-in-use";

export type MediaUsageAnswer = "uncheck" | "replace" | "remove" | "cancel";

export type MediaUsageOption = {
  answer: Exclude<MediaUsageAnswer, "cancel">;
  label: string;
  variant?: AdminButtonVariant;
};

export type AskMediaUsage = (items: MediaInUse[], options: MediaUsageOption[]) => Promise<MediaUsageAnswer>;

export type MediaUsageDialogState = {
  items: MediaInUse[];
  options: MediaUsageOption[];
  answer: (answer: MediaUsageAnswer) => void;
};

export function useMediaUsageDialog(onAsk?: () => void) {
  const [dialog, setDialog] = useState<MediaUsageDialogState | null>(null);

  const ask = useCallback(
    (items: MediaInUse[], options: MediaUsageOption[]) =>
      new Promise<MediaUsageAnswer>((resolve) => {
        onAsk?.();
        setDialog({
          items,
          options,
          answer: (answer) => {
            setDialog(null);
            resolve(answer);
          },
        });
      }),
    [onAsk]
  );

  return { dialog, ask };
}
