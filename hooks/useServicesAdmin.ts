"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import type { Service, ServiceCategory } from "@/app/admin/(protected)/services/lib/types";
import {
  createService,
  patchService,
  saveOrder,
  archiveService,
  deleteServiceForever,
  syncInquiryCounts,
} from "@/app/admin/(protected)/services/lib/api";
import {
  findCategoryById,
  findOthersCategory,
  isCreateServiceResponse,
} from "@/app/admin/(protected)/services/lib/ui";
import { useAdminAction } from "@/hooks/useAdminAction";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";

export function useServicesAdmin(
  initialServices: Service[],
  initialCategories: ServiceCategory[]
) {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>(initialServices);
  const categories = initialCategories;

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const { feedback: banner, setFeedback: setBanner, notify: showBanner } = useAdminAction({
    autoDismiss: true,
  });
  const bannerRef = useRef<HTMLDivElement | null>(null);

  async function withBusy(
    infoText: string,
    fn: () => Promise<void>,
    opts?: {
      successText?: string;
      errorFallback?: string;
      formatError?: (message: string) => string;
    }
  ) {
    if (busy) return;

    setBusy(true);
    showBanner("info", infoText);

    try {
      await fn();
      if (opts?.successText) showBanner("ok", opts.successText);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : opts?.errorFallback ?? "Action failed.";
      showBanner("err", opts?.formatError ? opts.formatError(message) : message);
    } finally {
      setBusy(false);
    }
  }

  const active = useMemo(
    () => services.filter((s) => s.isActive && !s.isArchived).sort((a, b) => a.order - b.order),
    [services]
  );

  const inactive = useMemo(
    () => services.filter((s) => !s.isActive && !s.isArchived).sort((a, b) => a.order - b.order),
    [services]
  );

  const archived = useMemo(
    () => services.filter((s) => s.isArchived).sort((a, b) => a.order - b.order),
    [services]
  );

  function onReorder(activeId: string, overId: string) {
    if (busy) return;

    const oldIndex = active.findIndex((s) => s.id === activeId);
    const newIndex = active.findIndex((s) => s.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(active, oldIndex, newIndex).map((s, idx) => ({ ...s, order: idx }));
    setServices((prev) => {
      const rest = prev.filter((p) => p.isArchived || !p.isActive);
      return [...reordered, ...rest];
    });
  }

  async function handleSaveOrder() {
    await withBusy(
      "Saving service order…",
      async () => {
        await saveOrder(active);
      },
      { successText: "✅ Order saved.", errorFallback: "Save order failed." }
    );
  }

  async function handleSyncInquiryCounts() {
    await withBusy(
      "Syncing inquiry counts…",
      async () => {
        await syncInquiryCounts();
        router.refresh();
      },
      {
        successText: "✅ Inquiry counts synced from actual inquiries.",
        errorFallback: "Sync inquiry counts failed.",
      }
    );
  }

  async function handleArchive(svc: Service) {
    if (busy) return;

    const ok = confirm(
      `Delete "${svc.name}"?\n\nThis will ARCHIVE it (hidden from public).\nYou can restore later.`
    );
    if (!ok) return;

    await withBusy(
      `Archiving "${svc.name}"…`,
      async () => {
        await archiveService(svc.id);
        setServices((prev) =>
          prev.map((p) => (p.id === svc.id ? { ...p, isArchived: true, isActive: false } : p))
        );
      },
      { successText: `✅ Archived "${svc.name}".`, errorFallback: "Archive failed." }
    );
  }

  async function handleRestore(svc: Service) {
    await withBusy(
      `Restoring "${svc.name}"…`,
      async () => {
        await patchService(svc.id, { isArchived: false });
        setServices((prev) =>
          prev.map((p) => (p.id === svc.id ? { ...p, isArchived: false } : p))
        );
      },
      { successText: `✅ Restored "${svc.name}".`, errorFallback: "Restore failed." }
    );
  }

  async function handleDeleteForever(svc: Service) {
    if (busy) return;

    if (svc.inquiriesCount > 0) {
      showBanner("err", "❌ Cannot delete forever: this service has inquiries. Keep it archived.");
      return;
    }

    const ok = confirm(`Delete "${svc.name}" FOREVER?\n\nThis cannot be undone.`);
    if (!ok) return;

    await withBusy(
      `Deleting "${svc.name}" forever…`,
      async () => {
        await deleteServiceForever(svc.id);
        setServices((prev) => prev.filter((p) => p.id !== svc.id));
      },
      { successText: `✅ Deleted "${svc.name}" forever.`, errorFallback: "Delete failed." }
    );
  }

  async function handleToggleActive(svc: Service) {
    const next = !svc.isActive;

    await withBusy(
      next ? `Activating "${svc.name}"…` : `Deactivating "${svc.name}"…`,
      async () => {
        await patchService(svc.id, { isActive: next });
        setServices((prev) =>
          prev.map((p) => (p.id === svc.id ? { ...p, isActive: next } : p))
        );
      },
      {
        successText: next ? `✅ Activated "${svc.name}".` : `✅ Deactivated "${svc.name}".`,
        errorFallback: "Update failed.",
        formatError: (message) => {
          if (String(message).includes("CATEGORY_INACTIVE")) {
            return `❌ Can't activate "${svc.name}" because its category is inactive. Activate the category first.`;
          }
          if (String(message).includes("SERVICE_ARCHIVED")) {
            return `❌ Can't activate "${svc.name}" because it's archived. Restore it first.`;
          }
          return `❌ ${message}`;
        },
      }
    );
  }

  async function bulkSetActive(ids: string[], value: boolean) {
    if (busy || ids.length === 0) return;
    setBusy(true);
    showBanner("info", value ? "Activating selected…" : "Deactivating selected…");
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await patchService(id, { isActive: value }); });
    setServices((prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isActive: value } : p)));
    showBanner(
      failed ? "err" : "ok",
      `${ok} ${value ? "activated" : "deactivated"}${failed ? `, ${failed} failed` : ""}.`,
    );
    setBusy(false);
  }

  async function bulkArchive(ids: string[]) {
    if (busy || ids.length === 0) return;
    if (!confirm(`Archive ${ids.length} service(s)? They will be hidden from public pages.`)) return;
    setBusy(true);
    showBanner("info", "Archiving selected…");
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await archiveService(id); });
    setServices((prev) =>
      prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: true, isActive: false } : p)),
    );
    showBanner(failed ? "err" : "ok", `${ok} archived${failed ? `, ${failed} failed` : ""}.`);
    setBusy(false);
  }

  async function bulkRestore(ids: string[]) {
    if (busy || ids.length === 0) return;
    setBusy(true);
    showBanner("info", "Restoring selected…");
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await patchService(id, { isArchived: false }); });
    setServices((prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: false } : p)));
    showBanner(failed ? "err" : "ok", `${ok} restored${failed ? `, ${failed} failed` : ""}.`);
    setBusy(false);
  }

  async function bulkDeleteForever(ids: string[]) {
    if (busy || ids.length === 0) return;
    const deletable = ids.filter((id) => (services.find((s) => s.id === id)?.inquiriesCount ?? 0) === 0);
    const blocked = ids.length - deletable.length;
    if (deletable.length === 0) {
      showBanner("err", "❌ None can be deleted — all selected have inquiries. Keep them archived.");
      return;
    }
    if (
      !confirm(
        `Delete ${deletable.length} service(s) FOREVER?${blocked ? ` (${blocked} with inquiries skipped)` : ""}\n\nThis cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    showBanner("info", "Deleting selected forever…");
    const { ok, failed, okIds } = await runBulkAction(deletable, async (id) => { await deleteServiceForever(id); });
    setServices((prev) => prev.filter((p) => !okIds.includes(p.id)));
    showBanner(
      failed || blocked ? "err" : "ok",
      `${ok} deleted${failed ? `, ${failed} failed` : ""}${blocked ? `, ${blocked} skipped (has inquiries)` : ""}.`,
    );
    setBusy(false);
  }

  async function handleCreateSave(patch: Partial<Service>) {
    await withBusy(
      "Creating service…",
      async () => {
        const raw = await createService(patch);
        if (!isCreateServiceResponse(raw) || raw.ok !== true) throw new Error("Create failed");

        const nextCategoryId =
          typeof patch.categoryId === "string" && patch.categoryId
            ? patch.categoryId
            : findOthersCategory(categories)?.id ?? null;

        const nextCategory = findCategoryById(categories, nextCategoryId)?.slug ?? "others";

        setServices((prev) => [
          ...prev,
          {
            id: raw.id,
            name: String(patch.name ?? ""),
            slug: String(patch.slug ?? ""),
            category: nextCategory,
            categoryId: nextCategoryId,
            description: String(patch.description ?? ""),
            startingPrice: patch.startingPrice ?? null,
            currency: String(patch.currency ?? "AED"),
            imageUrl: String(patch.imageUrl ?? ""),
            isActive: patch.isActive ?? true,
            isArchived: false,
            order: 0,
            inquiriesCount: 0,
          },
        ]);

        setCreating(false);
      },
      { successText: "✅ Service created.", errorFallback: "Create failed." }
    );
  }

  async function handleEditSave(patch: Partial<Service>) {
    if (!editing) return;
    const current = editing;

    await withBusy(
      `Updating "${current.name}"…`,
      async () => {
        await patchService(current.id, patch);

        const nextCategoryId =
          typeof patch.categoryId === "string" ? patch.categoryId : current.categoryId;

        const nextCategory =
          findCategoryById(categories, nextCategoryId)?.slug ??
          (nextCategoryId ? current.category : "others");

        setServices((prev) =>
          prev.map((p) =>
            p.id === current.id
              ? { ...p, ...patch, categoryId: nextCategoryId ?? null, category: nextCategory }
              : p
          )
        );

        setEditing(null);
      },
      { successText: "✅ Service updated.", errorFallback: "Save failed." }
    );
  }

  return {
    services,
    categories,
    editing,
    setEditing,
    creating,
    setCreating,
    busy,
    banner,
    setBanner,
    bannerRef,
    active,
    inactive,
    archived,
    onReorder,
    handleSaveOrder,
    handleSyncInquiryCounts,
    handleArchive,
    handleRestore,
    handleDeleteForever,
    handleToggleActive,
    handleCreateSave,
    handleEditSave,
    bulkSetActive,
    bulkArchive,
    bulkRestore,
    bulkDeleteForever,
  };
}
