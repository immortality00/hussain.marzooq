"use client";

import { useState } from "react";
import { runBulkAction, useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import type { AdminActionFeedbackType } from "@/components/admin/action-feedback/AdminActionFeedback";
import { deleteQuestion, type AskConfirm } from "@/components/admin/choice-dialog/ConfirmDialog";
import type { SliceUpdate } from "@/lib/client/admin-store";
import { countOf } from "@/lib/plural";
import { archiveInquiry, deleteInquiryForever, restoreInquiry } from "./api";
import type { Inquiry } from "./types";

type Notify = (type: AdminActionFeedbackType, text: string) => void;

const inquiries = (count: number) => countOf(count, "inquiry", "inquiries");

// Inquiries' bulk actions: archive or delete the selected active ones, restore or delete the selected archived ones.
export function useInquiryBulk<T extends Inquiry>(
  active: T[],
  archived: T[],
  setItems: (next: SliceUpdate<T[]>) => void,
  nameOf: (id: string) => string,
  notify: Notify,
  ask: AskConfirm
) {
  const activeSel = useBulkSelection(active.map((x) => x.id));
  const archivedSel = useBulkSelection(archived.map((x) => x.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  async function bulkArchive() {
    if (bulkBusy || activeSel.count === 0) return;
    if (!(await ask({ heading: `Archive ${inquiries(activeSel.count)}?`, action: "Archive" }))) return;
    const ids = activeSel.selectedIds;
    setBulkBusy(true);
    notify("info", "Archiving selected…");
    const result = await runBulkAction(ids, archiveInquiry);
    setItems((prev) => prev.map((p) => (result.okIds.includes(p.id) ? { ...p, isArchived: true } : p)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "archived", nameOf, "Archive failed."));
    activeSel.clear();
    setBulkBusy(false);
  }

  async function bulkRestore() {
    if (bulkBusy || archivedSel.count === 0) return;
    const ids = archivedSel.selectedIds;
    setBulkBusy(true);
    notify("info", "Restoring selected…");
    const result = await runBulkAction(ids, restoreInquiry);
    setItems((prev) => prev.map((p) => (result.okIds.includes(p.id) ? { ...p, isArchived: false } : p)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "restored", nameOf, "Restore failed."));
    archivedSel.clear();
    setBulkBusy(false);
  }

  async function bulkDeleteForever(which: "active" | "archived") {
    const sel = which === "active" ? activeSel : archivedSel;
    if (bulkBusy || sel.count === 0) return;
    if (!(await ask(deleteQuestion(inquiries(sel.count))))) return;
    const ids = sel.selectedIds;
    setBulkBusy(true);
    notify("info", "Deleting selected forever…");
    const result = await runBulkAction(ids, deleteInquiryForever);
    setItems((prev) => prev.filter((p) => !result.okIds.includes(p.id)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "deleted", nameOf, "Delete failed."));
    sel.clear();
    setBulkBusy(false);
  }

  return { activeSel, archivedSel, bulkBusy, bulkArchive, bulkRestore, bulkDeleteForever };
}
