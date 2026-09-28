"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import { useAdminAction } from "@/hooks/useAdminAction";
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
import type { Inquiry } from "./lib/types";

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const { feedback: msg, setFeedback: setMsg, notify, run } = useAdminAction();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showArchivedSection, setShowArchivedSection] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [actionBusy, setActionBusy] = useState(false);

  async function load() {
    setMsg(null);

    const raw = await fetchInquiries(statusFilter).then(
      (result) => result.raw,
      (err: unknown) => ({ ok: false, error: err instanceof Error ? err.message : undefined }),
    );

    if (!isApiResponse(raw) || raw.ok !== true || !Array.isArray(raw.items)) {
      const errText =
        isApiResponse(raw) && raw.ok === false && typeof raw.error === "string"
          ? raw.error
          : "Failed to load inquiries.";

      notify("err", errText);
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

  function nameOf(id: string) {
    return items.find((it) => it.id === id)?.name || "Unnamed";
  }

  async function bulkArchive() {
    if (bulkBusy || activeSel.count === 0) return;
    if (!confirm(`Archive ${activeSel.count} inquiry(ies)?`)) return;
    const ids = activeSel.selectedIds;
    setBulkBusy(true);
    notify("info", "Archiving selected…");
    const result = await runBulkAction(ids, archiveInquiry);
    setItems((prev) => prev.map((p) => (result.okIds.includes(p.id) ? { ...p, isArchived: true } : p)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "archived", nameOf, "Archive failed."));
    activeSel.clear();
    setBulkBusy(false);
  }

  async function bulkRestore() {
    if (bulkBusy || archivedSel.count === 0) return;
    const ids = archivedSel.selectedIds;
    setBulkBusy(true);
    notify("info", "Restoring selected…");
    const result = await runBulkAction(ids, restoreInquiry);
    setItems((prev) => prev.map((p) => (result.okIds.includes(p.id) ? { ...p, isArchived: false } : p)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "restored", nameOf, "Restore failed."));
    archivedSel.clear();
    setBulkBusy(false);
  }

  async function bulkDeleteForever(which: "active" | "archived") {
    const sel = which === "active" ? activeSel : archivedSel;
    if (bulkBusy || sel.count === 0) return;
    if (!confirm(`Delete ${sel.count} inquiry(ies) forever? This cannot be undone.`)) return;
    const ids = sel.selectedIds;
    setBulkBusy(true);
    notify("info", "Deleting selected forever…");
    const result = await runBulkAction(ids, deleteInquiryForever);
    setItems((prev) => prev.filter((p) => !result.okIds.includes(p.id)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "deleted", nameOf, "Delete failed."));
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

  async function act(fn: () => Promise<void>, loadingText: string, successText: string) {
    setActionBusy(true);
    await run(fn, { loadingText, successText });
    setActionBusy(false);
  }

  function collapse(id: string) {
    if (expandedId === id) setExpandedId("");
  }

  async function handleArchive(id: string) {
    if (actionBusy || !confirm("Archive this inquiry?")) return;
    await act(
      async () => {
        await archiveInquiry(id);
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)));
        collapse(id);
      },
      "Archiving inquiry…",
      "✅ Archived.",
    );
  }

  async function handleRestore(id: string) {
    if (actionBusy) return;
    await act(
      async () => {
        await restoreInquiry(id);
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: false } : p)));
      },
      "Restoring inquiry…",
      "✅ Restored.",
    );
  }

  async function handleDeleteForever(id: string) {
    if (actionBusy || !confirm("Delete forever? This cannot be undone.")) return;
    await act(
      async () => {
        await deleteInquiryForever(id);
        setItems((prev) => prev.filter((p) => p.id !== id));
        collapse(id);
      },
      "Deleting inquiry forever…",
      "✅ Deleted forever.",
    );
  }

  async function handleStatusChange(id: string, status: string) {
    if (actionBusy) return;
    await act(
      async () => {
        await patchInquiry(id, { status });
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      },
      "Updating inquiry status…",
      "✅ Status updated.",
    );
  }

  async function handleSaveNotes(id: string) {
    if (actionBusy) return;
    const value = notesMap[id] ?? "";
    await act(
      async () => {
        await patchInquiry(id, { adminNotes: value });
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, adminNotes: value } : p)));
      },
      "Saving inquiry notes…",
      "✅ Notes saved.",
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <InquiriesToolbar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onRefresh={load}
      />

      <AdminActionFeedback feedback={msg} />

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