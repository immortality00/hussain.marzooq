"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
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

  const { feedback: banner, setFeedback: setBanner } = useAdminAction();
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function clearBannerTimer() {
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
  }

  function showBanner(type: "ok" | "err" | "info", text: string) {
    clearBannerTimer();
    setBanner({ type, text });

    if (type !== "info") {
      const ms = type === "ok" ? 4000 : 7000;
      bannerTimerRef.current = window.setTimeout(() => setBanner(null), ms);
    }
  }

  useEffect(() => {
    return () => clearBannerTimer();
  }, []);

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

  function onDragEnd(event: DragEndEvent) {
    if (busy) return;

    const { active: a, over } = event;
    if (!over) return;
    if (a.id === over.id) return;

    const oldIndex = active.findIndex((s) => s.id === a.id);
    const newIndex = active.findIndex((s) => s.id === over.id);
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
    mounted,
    active,
    inactive,
    archived,
    onDragEnd,
    handleSaveOrder,
    handleSyncInquiryCounts,
    handleArchive,
    handleRestore,
    handleDeleteForever,
    handleToggleActive,
    handleCreateSave,
    handleEditSave,
  };
}
