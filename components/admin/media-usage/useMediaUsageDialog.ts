"use client";

import { useCallback } from "react";
import type { AdminButtonVariant } from "@/components/admin/AdminButton";
import type { MediaInUse } from "@/lib/media-in-use";
import { useChoice } from "@/components/admin/choice-dialog/useChoice";

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
  const { pending, ask: askChoice } = useChoice<{ items: MediaInUse[]; options: MediaUsageOption[] }, MediaUsageAnswer>(onAsk);
  const ask = useCallback<AskMediaUsage>((items, options) => askChoice({ items, options }), [askChoice]);
  const dialog: MediaUsageDialogState | null = pending ? { ...pending.question, answer: pending.answer } : null;
  return { dialog, ask };
}
