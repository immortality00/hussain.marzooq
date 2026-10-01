"use client";

import type { Service } from "@/app/admin/(protected)/services/lib/types";
import { archiveService, deleteServiceForever, patchService } from "@/app/admin/(protected)/services/lib/api";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import type { AdminActionFeedbackType } from "@/components/admin/action-feedback/AdminActionFeedback";

type BulkDeps = {
  services: Service[];
  setServices: (update: (previous: Service[]) => Service[]) => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  showBanner: (type: AdminActionFeedbackType, text: string) => void;
};

export function useServiceBulk({ services, setServices, busy, setBusy, showBanner }: BulkDeps) {
  async function run(
    ids: string[],
    busyText: string,
    perItem: (id: string) => Promise<unknown>,
    apply: (okIds: string[]) => (previous: Service[]) => Service[],
    summary: (ok: number, failed: number) => string,
    skipped = 0
  ) {
    if (busy || ids.length === 0) return;
    setBusy(true);
    showBanner("info", busyText);
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => {
      await perItem(id);
    });
    setServices(apply(okIds));
    showBanner(failed || skipped ? "err" : "ok", summary(ok, failed));
    setBusy(false);
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

  function bulkArchive(ids: string[]) {
    if (busy || ids.length === 0) return;
    if (!confirm(`Archive ${ids.length} service(s)? They will be hidden from public pages.`)) return;
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

  function bulkDeleteForever(ids: string[]) {
    if (busy || ids.length === 0) return;
    const deletable = ids.filter((id) => (services.find((s) => s.id === id)?.inquiriesCount ?? 0) === 0);
    const blocked = ids.length - deletable.length;
    if (deletable.length === 0) {
      showBanner("err", "❌ None can be deleted — all selected have inquiries. Keep them archived.");
      return;
    }
    const skipped = blocked ? ` (${blocked} with inquiries skipped)` : "";
    if (!confirm(`Delete ${deletable.length} service(s) FOREVER?${skipped}\n\nThis cannot be undone.`)) return;
    return run(
      deletable,
      "Deleting selected forever…",
      deleteServiceForever,
      (okIds) => (prev) => prev.filter((p) => !okIds.includes(p.id)),
      (ok, failed) => `${ok} deleted${failedText(failed)}${blocked ? `, ${blocked} skipped (has inquiries)` : ""}.`,
      blocked
    );
  }

  return { bulkSetActive, bulkArchive, bulkRestore, bulkDeleteForever };
}
