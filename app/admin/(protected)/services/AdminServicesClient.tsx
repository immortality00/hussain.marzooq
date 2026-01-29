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
import { createService, deleteService, patchService, saveOrder } from "./lib/api";

export default function AdminServicesClient({
  initialServices,
  initialCategories,
}: {
  initialServices: Service[];
  initialCategories: ServiceCategory[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [categories] = useState<ServiceCategory[]>(initialCategories);

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    try {
      const list = services.filter((s) => s.isActive).sort((a, b) => a.order - b.order);
      await saveOrder(list);
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
            className="rounded-xl bg-white px-4 py-2 text-sm text-black hover:opacity-90 disabled:opacity-50"
          >
            Create
          </button>

          <button
            disabled={busy}
            onClick={handleSaveOrder}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Save Order
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm opacity-70">
        Drag active services to reorder. Public listing uses this order.
      </p>

      <div className="mt-6 space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={active.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {active.map((s) => (
              <SortableServiceItem key={s.id} service={s} onEdit={(x) => setEditing(x)} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {inactive.length ? (
        <>
          <h2 className="mt-10 text-lg font-semibold">Inactive</h2>
          <div className="mt-4 space-y-3">
            {inactive.map((s) => (
              <div key={s.id} className="rounded-2xl border p-3 opacity-80">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs opacity-70">/{s.slug}</div>
                  </div>
                  <button
                    onClick={() => setEditing(s)}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-white/5"
                  >
                    Edit
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
        onDelete={async () => {}}
        onSave={async (patch) => {
          setBusy(true);
          try {
            const r = await createService(patch);
            const id = typeof (r as { id?: unknown })?.id === "string" ? (r as { id: string }).id : "";
            if (id) {
              setServices((prev) => [
                ...prev,
                {
                  id,
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
            }
            setCreating(false);
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
        onDelete={async () => {
          if (!editing) return;
          setBusy(true);
          try {
            await deleteService(editing.id, false);
            setServices((prev) =>
              prev.map((p) => (p.id === editing.id ? { ...p, isActive: false } : p))
            );
            setEditing(null);
          } finally {
            setBusy(false);
          }
        }}
        onSave={async (patch) => {
          if (!editing) return;
          setBusy(true);
          try {
            await patchService(editing.id, patch);
            setServices((prev) =>
              prev.map((p) => (p.id === editing.id ? { ...p, ...patch } : p))
            );
            setEditing(null);
          } finally {
            setBusy(false);
          }
        }}
      />
    </main>
  );
}