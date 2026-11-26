"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAddressValues } from "@/hooks/useAddressValues";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { ConfirmDialog, deleteQuestion, useConfirmDialog } from "@/components/admin/choice-dialog/ConfirmDialog";
import { INQUIRY_PARAMS } from "@/lib/admin-links";
import { revealRow } from "@/lib/client/list-return";
import InquirySection from "./components/InquirySection";
import InquiriesToolbar from "./components/InquiriesToolbar";
import { archiveInquiry, deleteInquiryForever, patchInquiry, restoreInquiry } from "./lib/api";
import { useInquiryBulk } from "./lib/useInquiryBulk";
import { useAdminSlice } from "@/hooks/useAdminData";
import { refreshAdminData } from "@/lib/client/admin-store";

export default function InquiriesAdminClient() {
  const [allItems, setItems] = useAdminSlice("inquiries");
  const [address, setAddress] = useAddressValues(INQUIRY_PARAMS);
  const statusFilter = address.status;
  // An inquiry alert opens its inquiry (`?open=<id>`): expanded at once, and brought into view once it is in the
  // list (the alert can arrive before the phone's data has it), then the address lets it go.
  const [expandedId, setExpandedId] = useState<string>(address.open);
  const { feedback: msg, setFeedback: setMsg, notify, run } = useAdminAction();
  const confirmation = useConfirmDialog(() => setMsg(null));
  const [showArchivedSection, setShowArchivedSection] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [actionBusy, setActionBusy] = useState(false);

  const items = useMemo(
    () => (statusFilter ? allItems.filter((it) => it.status === statusFilter) : allItems),
    [allItems, statusFilter],
  );

  async function load() {
    setMsg(null);
    await refreshAdminData();
  }

  const active = useMemo(() => items.filter((x) => !x.isArchived), [items]);
  const archived = useMemo(() => items.filter((x) => x.isArchived), [items]);

  function nameOf(id: string) {
    return items.find((it) => it.id === id)?.name || "Unnamed";
  }

  const { activeSel, archivedSel, bulkBusy, bulkArchive, bulkRestore, bulkDeleteForever } = useInquiryBulk(
    active,
    archived,
    setItems,
    nameOf,
    notify,
    confirmation.ask
  );

  const openId = address.open;
  const openListed = openId ? allItems.some((it) => it.id === openId) : false;
  useEffect(() => {
    if (openId && openListed && revealRow(openId)) setAddress({ open: "" });
  }, [openId, openListed, setAddress]);

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
    if (actionBusy) return;
    if (!(await confirmation.ask({ heading: `Archive the inquiry from “${nameOf(id)}”?`, action: "Archive" }))) return;
    await act(
      async () => {
        await archiveInquiry(id);
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)));
        collapse(id);
      },
      "Archiving inquiry…",
      "Inquiry archived.",
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
      "Inquiry restored.",
    );
  }

  async function handleDeleteForever(id: string) {
    if (actionBusy) return;
    if (!(await confirmation.ask(deleteQuestion(`the inquiry from “${nameOf(id)}”`)))) return;
    await act(
      async () => {
        await deleteInquiryForever(id);
        setItems((prev) => prev.filter((p) => p.id !== id));
        collapse(id);
      },
      "Deleting inquiry forever…",
      "Inquiry deleted.",
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
      "Status updated.",
    );
  }

  async function handleSaveNotes(id: string) {
    if (actionBusy) return;
    const value = notesMap[id] ?? allItems.find((it) => it.id === id)?.adminNotes ?? "";
    await act(
      async () => {
        await patchInquiry(id, { adminNotes: value });
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, adminNotes: value } : p)));
        setNotesMap((prev) => {
          const drafts = { ...prev };
          delete drafts[id];
          return drafts;
        });
      },
      "Saving inquiry notes…",
      "Notes saved.",
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <InquiriesToolbar
        statusFilter={statusFilter}
        setStatusFilter={(status) => setAddress({ status })}
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

      <ConfirmDialog dialog={confirmation.dialog} />
    </main>
  );
}