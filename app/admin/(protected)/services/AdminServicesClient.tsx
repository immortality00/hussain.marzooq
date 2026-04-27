"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import type { Service, ServiceCategory } from "./lib/types";
import SortableServiceItem from "./components/SortableServiceItem";
import ServiceEditorModal from "./components/ServiceEditorModal";
import ServiceStaticRow from "./components/ServiceStaticRow";
import ServiceSimpleSection from "./components/ServiceSimpleSection";
import ServicesBanner from "./components/ServicesBanner";
import ServicesToolbar from "./components/ServicesToolbar";
import {
  createService,
  patchService,
  saveOrder,
  archiveService,
  deleteServiceForever,
  syncInquiryCounts,
} from "./lib/api";
import {
  findCategoryById,
  findOthersCategory,
  isCreateServiceResponse,
  type Banner,
} from "./lib/ui";

export default function AdminServicesClient({
  initialServices,
  initialCategories,
}: {
  initialServices: Service[];
  initialCategories: ServiceCategory[];
}) {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>(initialServices);
  const categories = initialCategories;

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const [banner, setBanner] = useState<Banner>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const bannerTimerRef = useRef<number | null>(null);

  function clearBannerTimer() {
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
  }

  function showBanner(type: "ok" | "err", text: string) {
    clearBannerTimer();
    setBanner({ type, text });

    setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    const ms = type === "ok" ? 4000 : 7000;
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), ms);
  }

  useEffect(() => {
    return () => clearBannerTimer();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
    setBusy(true);
    try {
      await saveOrder(active);
      showBanner("ok", "✅ Order saved.");
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Save order failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncInquiryCounts() {
    setBusy(true);
    try {
      await syncInquiryCounts();
      router.refresh();
      showBanner("ok", "✅ Inquiry counts synced from actual inquiries.");
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Sync inquiry counts failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(svc: Service) {
    const ok = confirm(
      `Delete "${svc.name}"?\n\nThis will ARCHIVE it (hidden from public).\nYou can restore later.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      await archiveService(svc.id);
      setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isArchived: true, isActive: false } : p)));
      showBanner("ok", `✅ Archived "${svc.name}".`);
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Archive failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore(svc: Service) {
    setBusy(true);
    try {
      await patchService(svc.id, { isArchived: false });
      setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isArchived: false } : p)));
      showBanner("ok", `✅ Restored "${svc.name}".`);
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteForever(svc: Service) {
    if (svc.inquiriesCount > 0) {
      showBanner("err", "❌ Cannot delete forever: this service has inquiries. Keep it archived.");
      return;
    }

    const ok = confirm(`Delete "${svc.name}" FOREVER?\n\nThis cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    try {
      await deleteServiceForever(svc.id);
      setServices((prev) => prev.filter((p) => p.id !== svc.id));
      showBanner("ok", `✅ Deleted "${svc.name}" forever.`);
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(svc: Service) {
    setBusy(true);
    try {
      const next = !svc.isActive;
      await patchService(svc.id, { isActive: next });
      setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isActive: next } : p)));
      showBanner("ok", next ? `✅ Activated "${svc.name}".` : `✅ Deactivated "${svc.name}".`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Update failed.";

      if (String(message).includes("CATEGORY_INACTIVE")) {
        showBanner(
          "err",
          `❌ Can't activate "${svc.name}" because its category is inactive. Activate the category first.`
        );
      } else if (String(message).includes("SERVICE_ARCHIVED")) {
        showBanner("err", `❌ Can't activate "${svc.name}" because it's archived. Restore it first.`);
      } else {
        showBanner("err", `❌ ${message}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateSave(patch: Partial<Service>) {
    setBusy(true);
    try {
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
      showBanner("ok", "✅ Service created.");
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Create failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEditSave(patch: Partial<Service>) {
    if (!editing) return;

    setBusy(true);
    try {
      await patchService(editing.id, patch);

      const nextCategoryId =
        typeof patch.categoryId === "string"
          ? patch.categoryId
          : editing.categoryId;

      const nextCategory =
        findCategoryById(categories, nextCategoryId)?.slug ??
        (nextCategoryId ? editing.category : "others");

      setServices((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                ...patch,
                categoryId: nextCategoryId ?? null,
                category: nextCategory,
              }
            : p
        )
      );

      setEditing(null);
      showBanner("ok", "✅ Service updated.");
    } catch (e: unknown) {
      showBanner("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ServicesBanner banner={banner} onClose={() => setBanner(null)} containerRef={bannerRef} />

      <ServicesToolbar
        busy={busy}
        onSyncInquiryCounts={handleSyncInquiryCounts}
        onCreate={() => setCreating(true)}
        onSaveOrder={handleSaveOrder}
      />

      <h2 className="mt-6 text-lg font-semibold">Active</h2>
      <div className="mt-3 space-y-3">
        {!mounted ? (
          active.map((s) => (
            <ServiceStaticRow key={s.id} service={s} onEdit={setEditing} onArchive={(x) => void handleArchive(x)} />
          ))
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={active.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {active.map((s) => (
                <SortableServiceItem
                  key={s.id}
                  service={s}
                  onEdit={(x) => setEditing(x)}
                  onToggleActive={(x) => void handleToggleActive(x)}
                  onDeleteForever={(x) => void handleArchive(x)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ServiceSimpleSection
        title="Inactive"
        services={inactive}
        busy={busy}
        primaryActionLabel="Activate"
        onPrimaryAction={handleToggleActive}
        onEdit={setEditing}
        onSecondaryAction={handleArchive}
        secondaryActionLabel="Delete"
        secondaryDanger={true}
      />

      <ServiceSimpleSection
        title="Archived"
        description="Archived services are hidden from public pages. Restore them, or delete forever if there are no inquiries."
        services={archived}
        busy={busy}
        primaryActionLabel="Restore"
        onPrimaryAction={handleRestore}
        onEdit={setEditing}
        onSecondaryAction={handleDeleteForever}
        secondaryActionLabel="Delete forever"
        secondaryDanger={true}
        disableSecondaryWhen={(service) => service.inquiriesCount > 0}
      />

      <ServiceEditorModal
        open={creating}
        initial={null}
        categories={categories}
        onClose={() => setCreating(false)}
        onSave={handleCreateSave}
      />

      <ServiceEditorModal
        open={!!editing}
        initial={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
      />
    </main>
  );
}