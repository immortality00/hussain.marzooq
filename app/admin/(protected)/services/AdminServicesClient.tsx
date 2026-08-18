"use client";

import { SortableList } from "@/components/admin/sortable/SortableList";

import type { Service, ServiceCategory } from "./lib/types";
import SortableServiceItem from "./components/SortableServiceItem";
import ServiceEditorModal from "./components/ServiceEditorModal";
import ServiceSimpleSection from "./components/ServiceSimpleSection";
import ServicesBanner from "./components/ServicesBanner";
import ServicesToolbar from "./components/ServicesToolbar";
import { useServicesAdmin } from "@/hooks/useServicesAdmin";

export default function AdminServicesClient({
  initialServices,
  initialCategories,
}: {
  initialServices: Service[];
  initialCategories: ServiceCategory[];
}) {
  const {
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
    categories,
    onReorder,
    handleSaveOrder,
    handleSyncInquiryCounts,
    handleArchive,
    handleRestore,
    handleDeleteForever,
    handleToggleActive,
    handleCreateSave,
    handleEditSave,
  } = useServicesAdmin(initialServices, initialCategories);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ServicesBanner banner={banner} onClose={() => setBanner(null)} containerRef={bannerRef} />

      <ServicesToolbar
        busy={busy}
        onSyncInquiryCounts={handleSyncInquiryCounts}
        onCreate={() => {
          if (!busy) setCreating(true);
        }}
        onSaveOrder={handleSaveOrder}
      />

      <h2 className="mt-6 text-lg font-semibold">Active</h2>
      <SortableList ids={active.map((s) => s.id)} onReorder={onReorder} className="mt-3 space-y-3">
        {active.map((s, i) => (
          <SortableServiceItem
            key={s.id}
            service={s}
            index={i}
            onEdit={(x) => {
              if (!busy) setEditing(x);
            }}
            onToggleActive={(x) => void handleToggleActive(x)}
            onDeleteForever={(x) => void handleArchive(x)}
          />
        ))}
      </SortableList>

      <ServiceSimpleSection
        title="Inactive"
        services={inactive}
        busy={busy}
        primaryActionLabel="Activate"
        onPrimaryAction={handleToggleActive}
        onEdit={(service) => {
          if (!busy) setEditing(service);
        }}
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
        onEdit={(service) => {
          if (!busy) setEditing(service);
        }}
        onSecondaryAction={handleDeleteForever}
        secondaryActionLabel="Delete forever"
        secondaryDanger={true}
        disableSecondaryWhen={(service) => service.inquiriesCount > 0}
      />

      <ServiceEditorModal
        open={creating}
        initial={null}
        categories={categories}
        onClose={() => {
          if (!busy) setCreating(false);
        }}
        onSave={handleCreateSave}
      />

      <ServiceEditorModal
        open={!!editing}
        initial={editing}
        categories={categories}
        onClose={() => {
          if (!busy) setEditing(null);
        }}
        onSave={handleEditSave}
      />
    </main>
  );
}
