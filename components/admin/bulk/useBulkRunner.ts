"use client";

import { useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { runBulkAction, useBulkSelection } from "./useBulkSelection";
import { bulkResultText } from "./bulk-result";

export function useBulkRunner(
  ids: string[],
  labelOf: (id: string) => string,
  setFeedback: (next: AdminActionFeedbackState) => void
) {
  const selection = useBulkSelection(ids);
  const [busy, setBusy] = useState(false);

  async function run(
    busyText: string,
    verb: string,
    perItem: (id: string) => Promise<void>,
    apply: (okIds: string[]) => void
  ) {
    if (busy || selection.count === 0) return;
    setBusy(true);
    setFeedback({ type: "info", text: busyText });
    const result = await runBulkAction(selection.selectedIds, perItem);
    apply(result.okIds);
    selection.clear();
    setFeedback({ type: result.failed ? "err" : "ok", text: bulkResultText(result, verb, labelOf) });
    setBusy(false);
  }

  return { selection, busy, run };
}
