"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import InquirySection from "./components/InquirySection";
import InquiriesToolbar from "./components/InquiriesToolbar";
import {
  archiveInquiry,
  deleteInquiryForever,
  fetchInquiries,
  isApiResponse,
  patchInquiry,
  restoreInquiry,
} from "./lib/api";
import type { Banner, Inquiry } from "./lib/types";

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [msg, setMsg] = useState<Banner>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showArchivedSection, setShowArchivedSection] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [actionBusy, setActionBusy] = useState(false);

  async function load() {
    setMsg(null);

    const { raw } = await fetchInquiries(statusFilter);

    if (!isApiResponse(raw) || raw.ok !== true || !Array.isArray(raw.items)) {
      const errText =
        isApiResponse(raw) && raw.ok === false && typeof raw.error === "string"
          ? raw.error
          : "Failed to load inquiries.";

      setMsg({ type: "err", text: errText });
      return;
    }

    setItems(raw.items);

    setNotesMap((prev) => {
      const next = { ...prev };

      for (const it of raw.items) {
        if (next[it.id] === undefined) {
          next[it.id] = it.adminNotes ?? "";
        }
      }

      return next;
    });
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const active = useMemo(() => items.filter((x) => !x.isArchived), [items]);
  const archived = useMemo(() => items.filter((x) => x.isArchived), [items]);

  const activeSel = useBulkSelection(active.map((x) => x.id));
  const archivedSel = useBulkSelection(archived.map((x) => x.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  async function bulkArchive() {
    if (bulkBusy || activeSel.count === 0) return;
    if (!confirm(`Archive ${activeSel.count} inquiry(ies)?`)) return;
    const ids = activeSel.selectedIds;
    setBulkBusy(true);
    setMsg({ type: "info", text: "Archiving selected…" });
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await archiveInquiry(id); });
    setItems((prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: true } : p)));
    setMsg({ type: failed ? "err" : "ok", text: `${ok} archived${failed ? `, ${failed} failed` : ""}.` });
    activeSel.clear();
    setBulkBusy(false);
  }

  async function bulkRestore() {
    if (bulkBusy || archivedSel.count === 0) return;
    const ids = archivedSel.selectedIds;
    setBulkBusy(true);
    setMsg({ type: "info", text: "Restoring selected…" });
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await restoreInquiry(id); });
    setItems((prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, isArchived: false } : p)));
    setMsg({ type: failed ? "err" : "ok", text: `${ok} restored${failed ? `, ${failed} failed` : ""}.` });
    archivedSel.clear();
    setBulkBusy(false);
  }

  async function bulkDeleteForever(which: "active" | "archived") {
    const sel = which === "active" ? activeSel : archivedSel;
    if (bulkBusy || sel.count === 0) return;
    if (!confirm(`Delete ${sel.count} inquiry(ies) forever? This cannot be undone.`)) return;
    const ids = sel.selectedIds;
    setBulkBusy(true);
    setMsg({ type: "info", text: "Deleting selected forever…" });
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => { await deleteInquiryForever(id); });
    setItems((prev) => prev.filter((p) => !okIds.includes(p.id)));
    setMsg({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} failed` : ""}.` });
    sel.clear();
    setBulkBusy(false);
  }

  const counts = useMemo(() => {
    const m = new Map<string, number>();

    for (const it of active) {
      m.set(it.status, (m.get(it.status) ?? 0) + 1);
    }

    return m;
  }, [active]);

  function setNote(id: string, value: string) {
    setNotesMap((prev) => ({ ...prev, [id]: value }));
  }

  async function handleArchive(id: string) {
    if (actionBusy) return;

    const ok = confirm("Archive this inquiry?");
    if (!ok) return;

    setActionBusy(true);
    setMsg({ type: "info", text: "Archiving inquiry…" });

    try {
      await archiveInquiry(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)));

      if (expandedId === id) {
        setExpandedId("");
      }

      setMsg({ type: "ok", text: "✅ Archived." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Archive failed." });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleRestore(id: string) {
    if (actionBusy) return;

    setActionBusy(true);
    setMsg({ type: "info", text: "Restoring inquiry…" });

    try {
      await restoreInquiry(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: false } : p)));
      setMsg({ type: "ok", text: "✅ Restored." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Restore failed." });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteForever(id: string) {
    if (actionBusy) return;

    const ok = confirm("Delete forever? This cannot be undone.");
    if (!ok) return;

    setActionBusy(true);
    setMsg({ type: "info", text: "Deleting inquiry forever…" });

    try {
      await deleteInquiryForever(id);
      setItems((prev) => prev.filter((p) => p.id !== id));

      if (expandedId === id) {
        setExpandedId("");
      }

      setMsg({ type: "ok", text: "✅ Deleted forever." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    if (actionBusy) return;

    setActionBusy(true);
    setMsg({ type: "info", text: "Updating inquiry status…" });

    try {
      await patchInquiry(id, { status });
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      setMsg({ type: "ok", text: "✅ Status updated." });
    } catch (err: unknown) {
      setMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Status update failed.",
      });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleSaveNotes(id: string) {
    if (actionBusy) return;

    setActionBusy(true);
    setMsg({ type: "info", text: "Saving inquiry notes…" });

    try {
      const value = notesMap[id] ?? "";

      await patchInquiry(id, { adminNotes: value });

      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, adminNotes: value } : p)));
      setMsg({ type: "ok", text: "✅ Notes saved." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Save notes failed." });
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <InquiriesToolbar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onRefresh={load}
      />

      <AdminActionFeedback feedback={msg} className="mt-4" />

      <InquirySection
        title="Active"
        list={active}
        archivedMode={false}
        expandedId={expandedId}
        setExpandedId={(id) => {
          if (actionBusy) return;
          setExpandedId(id);
          setMsg(null);
        }}
        notesMap={notesMap}
        setNote={setNote}
        onSaveNotes={handleSaveNotes}
        onStatusChange={handleStatusChange}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDeleteForever={handleDeleteForever}
        isSelected={activeSel.isSelected}
        onToggleSelect={activeSel.toggle}
        selectAll={{
          checked: activeSel.allSelected,
          indeterminate: activeSel.count > 0 && !activeSel.allSelected,
          onChange: activeSel.toggleAll,
        }}
      />

      <BulkActionBar
        count={activeSel.count}
        busy={bulkBusy}
        onClear={activeSel.clear}
        actions={[
          { label: "Archive", onRun: bulkArchive },
          { label: "Delete forever", tone: "danger", onRun: () => bulkDeleteForever("active") },
        ]}
      />

      <div className="mt-6">
        <button
          type="button"
          disabled={actionBusy}
          className={adminButtonClasses("default", "md")}
          onClick={() => setShowArchivedSection((p) => !p)}
        >
          {showArchivedSection ? "Hide Archived" : `Show Archived (${archived.length})`}
        </button>
      </div>

      {showArchivedSection ? (
        <>
          <InquirySection
            title="Archived"
            list={archived}
            archivedMode={true}
            expandedId={expandedId}
            setExpandedId={(id) => {
              if (actionBusy) return;
              setExpandedId(id);
              setMsg(null);
            }}
            notesMap={notesMap}
            setNote={setNote}
            onSaveNotes={handleSaveNotes}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onDeleteForever={handleDeleteForever}
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
            busy={bulkBusy}
            onClear={archivedSel.clear}
            actions={[
              { label: "Restore", onRun: bulkRestore },
              { label: "Delete forever", tone: "danger", onRun: () => bulkDeleteForever("archived") },
            ]}
          />
        </>
      ) : null}
    </main>
  );
}