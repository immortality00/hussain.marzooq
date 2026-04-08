"use client";

import { useMemo, useState } from "react";
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
import {
  createService,
  patchService,
  saveOrder,
  activateService,
  deactivateService,
  deleteServiceForever,
} from "./lib/api";

type CreateServiceResponse = { ok: true; id: string } | { ok: false; error: string };

function isCreateServiceResponse(v: unknown): v is CreateServiceResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return typeof r.id === "string" && r.id.length > 0;
  if (r.ok === false) return typeof r.error === "string";
  return false;
}

export default function AdminServicesClient({
  initialServices,
  initialCategories,
}: {
  initialServices: Service[];
  initialCategories: ServiceCategory[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const categories = initialCategories; // no need for setCategories

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const active = useMemo(
    () => services.filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    [services]
  );
  const inactive = useMemo(
    () => services.filter((s) => !s.isActive).sort((a, b) => a.order - b.order),
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
      const rest = prev.filter((p) => !p.isActive);
      return [...reordered, ...rest];
    });
  }

  async function handleSaveOrder() {
    setMsg("");
    setBusy(true);
    try {
      const list = services.filter((s) => s.isActive).sort((a, b) => a.order - b.order);
      await saveOrder(list);
      setMsg("✅ Order saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Save order failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(svc: Service) {
    setMsg("");
    setBusy(true);
    try {
      if (svc.isActive) {
        await deactivateService(svc.id);
        setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isActive: false } : p)));
      } else {
        await activateService(svc.id);
        setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isActive: true } : p)));
      }
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteForever(svc: Service) {
    setMsg("");
    const ok = confirm(
      `Delete "${svc.name}" forever?\n\nThis cannot be undone.\nIf this service has inquiries, deletion will be blocked.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      await deleteServiceForever(svc.id);
      setServices((prev) => prev.filter((p) => p.id !== svc.id));
      if (editing?.id === svc.id) setEditing(null);
      setMsg("✅ Deleted forever.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Delete failed.";
      if (String(message).includes("SERVICE_HAS_INQUIRIES")) {
        setMsg("❌ Cannot delete: this service has inquiries. Deactivate it instead.");
      } else {
        setMsg(`❌ ${message}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Services</h1>

        <div className="flex items-center gap-2">
          <button
            disabled={busy}
            onClick={() => setCreating(true)}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
          >
            Create
          </button>

          <button
            disabled={busy}
            onClick={handleSaveOrder}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60"
          >
            Save Order
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Drag active services to reorder. Public listing uses this order. You can Activate/Deactivate or Delete forever.
      </p>

      {msg ? <div className="mt-3 text-sm text-muted-foreground">{msg}</div> : null}

      <div className="mt-6 space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={active.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {active.map((s) => (
              <SortableServiceItem
                key={s.id}
                service={s}
                onEdit={(x) => setEditing(x)}
                onToggleActive={(x) => void handleToggleActive(x)}
                onDeleteForever={(x) => void handleDeleteForever(x)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {inactive.length ? (
        <>
          <h2 className="mt-10 text-lg font-semibold">Inactive</h2>
          <div className="mt-4 space-y-3">
            {inactive.map((s) => (
              <div key={s.id} className="rounded-2xl border p-3 opacity-90">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">/{s.slug}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleToggleActive(s)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => void handleDeleteForever(s)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
          setMsg("");
          setBusy(true);
          try {
            const raw = await createService(patch);
            if (!isCreateServiceResponse(raw) || raw.ok !== true) {
              const err = isCreateServiceResponse(raw) && raw.ok === false ? raw.error : "Create failed.";
              setMsg(`❌ ${err}`);
              return;
            }

            setServices((prev) => [
              ...prev,
              {
                id: raw.id,
                name: String(patch.name ?? ""),
                slug: String(patch.slug ?? ""),
                category: String(patch.category ?? "general"),
                description: String(patch.description ?? ""),
                startingPrice: patch.startingPrice ?? null,
                currency: String(patch.currency ?? "AED"),
                imageUrl: String(patch.imageUrl ?? ""),
                isActive: patch.isActive ?? true,
                order: 0,
                inquiriesCount: 0,
              },
            ]);
            setCreating(false);
            setMsg("✅ Service created.");
          } catch (e: unknown) {
            setMsg(e instanceof Error ? e.message : "Create failed.");
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
          setMsg("");
          setBusy(true);
          try {
            await patchService(editing.id, patch);
            setServices((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...patch } : p)));
            setEditing(null);
            setMsg("✅ Saved.");
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Save failed.";
            if (String(message).includes("CATEGORY_NOT_FOUND")) {
              setMsg("❌ This category no longer exists. Choose a valid category or use 'general'.");
            } else {
              setMsg(`❌ ${message}`);
            }
          } finally {
            setBusy(false);
          }
        }}
      />
    </main>
  );
}