"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { createService, patchService, saveOrder, archiveService, deleteServiceForever } from "./lib/api";

type CreateServiceResponse = { ok: true; id: string } | { ok: false; error: string };

function isCreateServiceResponse(v: unknown): v is CreateServiceResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return typeof r.id === "string";
  if (r.ok === false) return typeof r.error === "string";
  return false;
}

type Banner = { type: "ok" | "err"; text: string } | null;

function StaticRow({
  service,
  onEdit,
  onArchive,
}: {
  service: Service;
  onEdit: (s: Service) => void;
  onArchive: (s: Service) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border p-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{service.name}</div>
        <div className="text-xs text-muted-foreground truncate">/{service.slug}</div>
      </div>
      <div className="flex gap-2">
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40" onClick={() => onEdit(service)}>
          Edit
        </button>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10" onClick={() => onArchive(service)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminServicesClient({
  initialServices,
  initialCategories,
}: {
  initialServices: Service[];
  initialCategories: ServiceCategory[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const categories = initialCategories;

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sticky banner
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

    // Ensure user sees it
    setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    // Auto-dismiss
    const ms = type === "ok" ? 4000 : 7000;
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), ms);
  }

  useEffect(() => {
    return () => clearBannerTimer();
  }, []);

  // Hydration-safe DnD mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const active = useMemo(
    () =>
      services
        .filter((s) => s.isActive && !s.isArchived)
        .sort((a, b) => a.order - b.order),
    [services]
  );

  const inactive = useMemo(
    () =>
      services
        .filter((s) => !s.isActive && !s.isArchived)
        .sort((a, b) => a.order - b.order),
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

      // NOTE: API enforces CATEGORY_INACTIVE and SERVICE_ARCHIVED rules
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Sticky banner */}
      <div ref={bannerRef} className="sticky top-3 z-40">
        {banner ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur ${
              banner.type === "ok"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>{banner.text}</div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="rounded-lg border px-2 py-1 text-xs hover:bg-accent/40"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Services</h1>
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => setCreating(true)}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
          >
            Create
          </button>
          <button
            disabled={busy}
            onClick={() => void handleSaveOrder()}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60"
          >
            Save Order
          </button>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold">Active</h2>
      <div className="mt-3 space-y-3">
        {!mounted ? (
          active.map((s) => (
            <StaticRow key={s.id} service={s} onEdit={setEditing} onArchive={(x) => void handleArchive(x)} />
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
                  // We repurpose "Delete" to archive (Option A)
                  onDeleteForever={(x) => void handleArchive(x)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {inactive.length ? (
        <>
          <h2 className="mt-10 text-lg font-semibold">Inactive</h2>
          <div className="mt-3 space-y-3">
            {inactive.map((s) => (
              <div key={s.id} className="rounded-2xl border p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">/{s.slug}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40"
                    onClick={() => setEditing(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40"
                    onClick={() => void handleToggleActive(s)}
                    disabled={busy}
                  >
                    Activate
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10"
                    onClick={() => void handleArchive(s)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {archived.length ? (
        <>
          <h2 className="mt-10 text-lg font-semibold">Archived</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Archived services are hidden from public pages. Restore them, or delete forever if there are no inquiries.
          </p>
          <div className="mt-3 space-y-3">
            {archived.map((s) => (
              <div key={s.id} className="rounded-2xl border p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">/{s.slug}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40"
                    onClick={() => void handleRestore(s)}
                    disabled={busy}
                  >
                    Restore
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10 disabled:opacity-50"
                    onClick={() => void handleDeleteForever(s)}
                    disabled={busy || s.inquiriesCount > 0}
                    title={s.inquiriesCount > 0 ? "Has inquiries" : "Delete forever"}
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <ServiceEditorModal
        open={creating}
        initial={null}
        categories={categories}
        onClose={() => setCreating(false)}
        onSave={async (patch) => {
          setBusy(true);
          try {
            const raw = await createService(patch);
            if (!isCreateServiceResponse(raw) || raw.ok !== true) throw new Error("Create failed");

            setServices((prev) => [
              ...prev,
              {
                id: raw.id,
                name: String(patch.name ?? ""),
                slug: String(patch.slug ?? ""),
                category: String(patch.category ?? "others"),
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
        }}
      />

      <ServiceEditorModal
        open={!!editing}
        initial={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={async (patch) => {
          if (!editing) return;
          setBusy(true);
          try {
            await patchService(editing.id, patch);
            setServices((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...patch } : p)));
            setEditing(null);
            showBanner("ok", "✅ Service updated.");
          } catch (e: unknown) {
            showBanner("err", e instanceof Error ? e.message : "Save failed.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </main>
  );
}