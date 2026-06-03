"use client";

import { useEffect, useMemo, useState } from "react";
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
    const ok = confirm("Archive this inquiry?");
    if (!ok) return;

    try {
      await archiveInquiry(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)));

      if (expandedId === id) {
        setExpandedId("");
      }

      setMsg({ type: "ok", text: "✅ Archived." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Archive failed." });
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreInquiry(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: false } : p)));
      setMsg({ type: "ok", text: "✅ Restored." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Restore failed." });
    }
  }

  async function handleDeleteForever(id: string) {
    const ok = confirm("Delete forever? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteInquiryForever(id);
      setItems((prev) => prev.filter((p) => p.id !== id));

      if (expandedId === id) {
        setExpandedId("");
      }

      setMsg({ type: "ok", text: "✅ Deleted forever." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Delete failed." });
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await patchInquiry(id, { status });
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      setMsg({ type: "ok", text: "✅ Status updated." });
    } catch (err: unknown) {
      setMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Status update failed.",
      });
    }
  }

  async function handleSaveNotes(id: string) {
    try {
      const value = notesMap[id] ?? "";

      await patchInquiry(id, { adminNotes: value });

      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, adminNotes: value } : p)));
      setMsg({ type: "ok", text: "✅ Notes saved." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Save notes failed." });
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <InquiriesToolbar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onRefresh={load}
      />

      {msg ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <InquirySection
        title="Active"
        list={active}
        archivedMode={false}
        expandedId={expandedId}
        setExpandedId={(id) => {
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
      />

      <div className="mt-6">
        <button
          type="button"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
          onClick={() => setShowArchivedSection((p) => !p)}
        >
          {showArchivedSection ? "Hide Archived" : `Show Archived (${archived.length})`}
        </button>
      </div>

      {showArchivedSection ? (
        <InquirySection
          title="Archived"
          list={archived}
          archivedMode={true}
          expandedId={expandedId}
          setExpandedId={(id) => {
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
        />
      ) : null}
    </main>
  );
}