"use client";

import { useMemo, useRef, useState } from "react";
import { useDraftOrder } from "@/hooks/useDraftOrder";
import { useAdminSlice } from "@/hooks/useAdminData";
import { useServiceBulk } from "@/hooks/useServiceBulk";
import type { Service, ServiceCategory } from "@/app/admin/(protected)/services/lib/types";
import {
  createService,
  patchService,
  archiveService,
  deleteServiceForever,
  syncInquiryCounts,
} from "@/app/admin/(protected)/services/lib/api";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { saveGuarded } from "@/lib/record-changed";

const INACTIVE_REASONS: [string, string][] = [
  ["CATEGORY_INACTIVE", "because its category is inactive. Activate the category first."],
  ["SERVICE_ARCHIVED", "because it's archived. Restore it first."],
];

export function useServicesAdmin() {
  const [services, setServices] = useAdminSlice("services");
  const [serviceCategories] = useAdminSlice("serviceCategories");
  const categories = useMemo<ServiceCategory[]>(
    () => serviceCategories.map(({ id, name, slug, isActive, order }) => ({ id, name, slug, isActive, order })),
    [serviceCategories]
  );

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const { feedback: banner, setFeedback: setBanner, notify: showBanner } = useAdminAction({ autoDismiss: true });
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const changed = useRecordChangedDialog(() => setBanner(null));

  const replace = (item: Service) => setServices((prev) => prev.map((p) => (p.id === item.id ? item : p)));

  async function withBusy(infoText: string, fn: () => Promise<string | null>, formatError?: (message: string) => string) {
    if (busy) return;
    setBusy(true);
    showBanner("info", infoText);
    try {
      const successText = await fn();
      if (successText) showBanner("ok", successText);
      else setBanner(null);
    } catch (e: unknown) {
      const message = errorMessage(e);
      showBanner("err", formatError ? formatError(message) : message);
    } finally {
      setBusy(false);
    }
  }

  const activeSaved = useMemo(() => services.filter((s) => s.isActive && !s.isArchived), [services]);
  const { ordered: active, move, save } = useDraftOrder(activeSaved, setServices);
  const inactive = useMemo(
    () => services.filter((s) => !s.isActive && !s.isArchived).sort((a, b) => a.order - b.order),
    [services]
  );
  const archived = useMemo(() => services.filter((s) => s.isArchived).sort((a, b) => a.order - b.order), [services]);

  const bulk = useServiceBulk({ services, setServices, busy, setBusy, showBanner });

  function onReorder(activeId: string, overId: string) {
    if (!busy) move(activeId, overId);
  }

  const handleSaveOrder = () =>
    withBusy("Saving service order…", async () => {
      await save((id, order) => patchService(id, { order }));
      return "✅ Order saved.";
    });

  const handleSyncInquiryCounts = () =>
    withBusy("Syncing inquiry counts…", async () => {
      await syncInquiryCounts();
      return "✅ Inquiry counts synced from actual inquiries.";
    });

  async function handleArchive(svc: Service) {
    if (busy) return;
    if (!confirm(`Delete "${svc.name}"?\n\nThis will ARCHIVE it (hidden from public).\nYou can restore later.`)) return;
    await withBusy(`Archiving "${svc.name}"…`, async () => {
      await archiveService(svc.id);
      setServices((prev) => prev.map((p) => (p.id === svc.id ? { ...p, isArchived: true, isActive: false } : p)));
      return `✅ Archived "${svc.name}".`;
    });
  }

  const handleRestore = (svc: Service) =>
    withBusy(`Restoring "${svc.name}"…`, async () => {
      const item = await patchService(svc.id, { isArchived: false });
      if (item) replace(item);
      return `✅ Restored "${svc.name}".`;
    });

  async function handleDeleteForever(svc: Service) {
    if (busy) return;
    if (svc.inquiriesCount > 0) {
      showBanner("err", "❌ Cannot delete forever: this service has inquiries. Keep it archived.");
      return;
    }
    if (!confirm(`Delete "${svc.name}" FOREVER?\n\nThis cannot be undone.`)) return;
    await withBusy(`Deleting "${svc.name}" forever…`, async () => {
      await deleteServiceForever(svc.id);
      setServices((prev) => prev.filter((p) => p.id !== svc.id));
      return `✅ Deleted "${svc.name}" forever.`;
    });
  }

  function handleToggleActive(svc: Service) {
    const next = !svc.isActive;
    return withBusy(
      next ? `Activating "${svc.name}"…` : `Deactivating "${svc.name}"…`,
      async () => {
        const item = await patchService(svc.id, { isActive: next });
        if (item) replace(item);
        return next ? `✅ Activated "${svc.name}".` : `✅ Deactivated "${svc.name}".`;
      },
      (message) => {
        const reason = INACTIVE_REASONS.find(([code]) => message.includes(code));
        return reason ? `❌ Can't activate "${svc.name}" ${reason[1]}` : `❌ ${message}`;
      }
    );
  }

  const handleCreateSave = async (patch: Partial<Service>) =>
    withBusy("Creating service…", async () => {
      const item = await createService(patch);
      setServices((prev) => [...prev.filter((p) => p.id !== item.id), item]);
      setCreating(false);
      return "✅ Service created.";
    });

  async function handleEditSave(patch: Partial<Service>) {
    if (!editing) return;
    const current = editing;
    return withBusy(`Updating "${current.name}"…`, async () => {
      const item = await saveGuarded(
        current.updatedAt,
        (expected) => patchService(current.id, patch, expected),
        changed.ask,
        (latest: Service) => latest.updatedAt,
        (latest: Service) => {
          replace(latest);
          setEditing(latest);
        }
      );
      if (!item) return null;
      replace(item);
      setEditing(null);
      return "✅ Service updated.";
    });
  }

  return {
    services, categories, editing, setEditing, creating, setCreating, busy, banner, setBanner, bannerRef,
    active, inactive, archived, onReorder, handleSaveOrder, handleSyncInquiryCounts, handleArchive, handleRestore,
    handleDeleteForever, handleToggleActive, handleCreateSave, handleEditSave, changedDialog: changed.dialog,
    ...bulk,
  };
}
