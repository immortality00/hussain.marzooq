"use client";

import { SortableList } from "@/components/admin/sortable/SortableList";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";

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
    bulkSetActive,
    bulkArchive,
    bulkRestore,
    bulkDeleteForever,
  } = useServicesAdmin(initialServices, initialCategories);

  const activeSel = useBulkSelection(active.map((s) => s.id));
  const inactiveSel = useBulkSelection(inactive.map((s) => s.id));
  const archivedSel = useBulkSelection(archived.map((s) => s.id));

  async function runAndClear(fn: () => Promise<void>, clear: () => void) {
    await fn();
    clear();
  }

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

      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Active</h2>
        {active.length > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <BulkCheckbox
              checked={activeSel.allSelected}
              indeterminate={activeSel.count > 0 && !activeSel.allSelected}
              onChange={activeSel.toggleAll}
              label="Select all active services"
            />
            Select all
          </div>
        )}
      </div>
      <SortableList ids={active.map((s) => s.id)} onReorder={onReorder} className="mt-3 space-y-3">
        {active.map((s, i) => (
          <SortableServiceItem
            key={s.id}
            service={s}
            index={i}
            selected={activeSel.isSelected(s.id)}
            onToggleSelect={() => activeSel.toggle(s.id)}
            onEdit={(x) => {
              if (!busy) setEditing(x);
            }}
            onToggleActive={(x) => void handleToggleActive(x)}
            onDeleteForever={(x) => void handleArchive(x)}
          />
        ))}
      </SortableList>
      <BulkActionBar
        count={activeSel.count}
        busy={busy}
        onClear={activeSel.clear}
        actions={[
          { label: "Deactivate", onRun: () => runAndClear(() => bulkSetActive(activeSel.selectedIds, false), activeSel.clear) },
          { label: "Archive", tone: "danger", onRun: () => runAndClear(() => bulkArchive(activeSel.selectedIds), activeSel.clear) },
        ]}
      />

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
        isSelected={inactiveSel.isSelected}
        onToggleSelect={inactiveSel.toggle}
        selectAll={{
          checked: inactiveSel.allSelected,
          indeterminate: inactiveSel.count > 0 && !inactiveSel.allSelected,
          onChange: inactiveSel.toggleAll,
        }}
      />
      <BulkActionBar
        count={inactiveSel.count}
        busy={busy}
        onClear={inactiveSel.clear}
        actions={[
          { label: "Activate", onRun: () => runAndClear(() => bulkSetActive(inactiveSel.selectedIds, true), inactiveSel.clear) },
          { label: "Archive", tone: "danger", onRun: () => runAndClear(() => bulkArchive(inactiveSel.selectedIds), inactiveSel.clear) },
        ]}
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
        isSelected={archivedSel.isSelected}
        onToggleSelect={archivedSel.toggle}
        selectAll={{
          checked: archivedSel.allSelected,
          indeterminate: archivedSel.count > 0 && !archivedSel.allSelected,
          onChange: archivedSel.toggleAll,
        }}
      />
      <BulkActionBar
        count={archivedSel.count}
        busy={busy}
        onClear={archivedSel.clear}
        actions={[
          { label: "Restore", onRun: () => runAndClear(() => bulkRestore(archivedSel.selectedIds), archivedSel.clear) },
          { label: "Delete forever", tone: "danger", onRun: () => runAndClear(() => bulkDeleteForever(archivedSel.selectedIds), archivedSel.clear) },
        ]}
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
