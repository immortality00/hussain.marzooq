"use client";

import type { Service } from "@/app/admin/(protected)/services/lib/types";
import { archiveService, deleteServiceForever, patchService } from "@/app/admin/(protected)/services/lib/api";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import type { AdminActionFeedbackType } from "@/components/admin/action-feedback/AdminActionFeedback";
import { CANNOT_UNDO, deleteQuestion, type AskConfirm } from "@/components/admin/choice-dialog/ConfirmDialog";
import { countOf } from "@/lib/plural";

type BulkDeps = {
  services: Service[];
  setServices: (update: (previous: Service[]) => Service[]) => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  showBanner: (type: AdminActionFeedbackType, text: string) => void;
  ask: AskConfirm;
};

const serviceCount = (count: number) => countOf(count, "service");

// Each action resolves true once it has run, so the screen clears the selection then — and keeps it when the
// question was cancelled.
export function useServiceBulk({ services, setServices, busy, setBusy, showBanner, ask }: BulkDeps) {
  async function run(
    ids: string[],
    busyText: string,
    perItem: (id: string) => Promise<unknown>,
    apply: (okIds: string[]) => (previous: Service[]) => Service[],
    summary: (ok: number, failed: number) => string,
    skipped = 0
  ) {
    if (busy || ids.length === 0) return false;
    setBusy(true);
    showBanner("info", busyText);
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => {
      await perItem(id);
    });
    setServices(apply(okIds));
    showBanner(failed || skipped ? "err" : "ok", summary(ok, failed));
    setBusy(false);
    return true;
  }

  const failedText = (failed: number) => (failed ? `, ${failed} failed` : "");

  const bulkSetActive = (ids: string[], value: boolean) =>
    run(
      ids,
      value ? "Activating selected…" : "Deactivating selected…",
      (id) => patchService(id, { isActive: value }),
      (okIds) => (prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isActive: value } : p)),
      (ok, failed) => `${ok} ${value ? "activated" : "deactivated"}${failedText(failed)}.`
    );

  async function bulkArchive(ids: string[]) {
    if (busy || ids.length === 0) return false;
    const question = {
      heading: `Archive ${serviceCount(ids.length)}?`,
      detail:
        ids.length === 1
          ? "It's hidden from the public pages until you restore it."
          : "They're hidden from the public pages until you restore them.",
      action: "Archive",
    };
    if (!(await ask(question))) return false;
    return run(
      ids,
      "Archiving selected…",
      archiveService,
      (okIds) => (prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: true, isActive: false } : p)),
      (ok, failed) => `${ok} archived${failedText(failed)}.`
    );
  }

  const bulkRestore = (ids: string[]) =>
    run(
      ids,
      "Restoring selected…",
      (id) => patchService(id, { isArchived: false }),
      (okIds) => (prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: false } : p)),
      (ok, failed) => `${ok} restored${failedText(failed)}.`
    );

  async function bulkDeleteForever(ids: string[]) {
    if (busy || ids.length === 0) return false;
    const deletable = ids.filter((id) => (services.find((s) => s.id === id)?.inquiriesCount ?? 0) === 0);
    const blocked = ids.length - deletable.length;
    if (deletable.length === 0) {
      showBanner("err", "None of them can be deleted: each has inquiries.");
      return false;
    }
    const kept = blocked ? `${blocked} with inquiries ${blocked === 1 ? "stays" : "stay"} archived. ` : "";
    if (!(await ask(deleteQuestion(serviceCount(deletable.length), `${kept}${CANNOT_UNDO}`)))) return false;
    return run(
      deletable,
      "Deleting selected…",
      deleteServiceForever,
      (okIds) => (prev) => prev.filter((p) => !okIds.includes(p.id)),
      (ok, failed) => `${ok} deleted${failedText(failed)}${blocked ? `, ${blocked} skipped (has inquiries)` : ""}.`,
      blocked
    );
  }

  return { bulkSetActive, bulkArchive, bulkRestore, bulkDeleteForever };
}
