"use client";

import type { Inquiry } from "../lib/types";
import { fmt, statusPill } from "../lib/utils";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import IconButton from "./IconButton";
import { ArchiveIcon, DeleteIcon, RestoreIcon } from "./InquiryIcons";
import InquiryExpandedCard from "./InquiryExpandedCard";

export default function InquirySection({
  title,
  list,
  archivedMode,
  expandedId,
  setExpandedId,
  notesMap,
  setNote,
  onSaveNotes,
  onStatusChange,
  onArchive,
  onRestore,
  onDeleteForever,
  isSelected,
  onToggleSelect,
  selectAll,
}: {
  title: string;
  list: Inquiry[];
  archivedMode: boolean;
  expandedId: string;
  setExpandedId: (id: string) => void;
  notesMap: Record<string, string>;
  setNote: (id: string, value: string) => void;
  onSaveNotes: (id: string) => void | Promise<void>;
  onStatusChange: (id: string, status: string) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
  onDeleteForever: (id: string) => void | Promise<void>;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  selectAll: { checked: boolean; indeterminate: boolean; onChange: () => void };
}) {
  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? "" : id);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-background/70">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{list.length} item(s)</div>
      </div>

      <div className="overflow-x-auto">
      <div className="min-w-[680px]">
      <div className="flex items-center gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
        {list.length > 0 && (
          <BulkCheckbox
            checked={selectAll.checked}
            indeterminate={selectAll.indeterminate}
            onChange={selectAll.onChange}
            label={`Select all ${title.toLowerCase()} inquiries`}
          />
        )}
        <div className="grid flex-1 grid-cols-12 gap-2">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
      </div>

      {list.map((it) => {
        const expanded = expandedId === it.id;

        return (
          <div key={it.id} className="border-b last:border-b-0">
            <div className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/20">
              <BulkCheckbox
                checked={isSelected(it.id)}
                onChange={() => onToggleSelect(it.id)}
                label={`Select inquiry from ${it.name}`}
              />
              <div className="grid flex-1 grid-cols-12 gap-2">
              <button
                type="button"
                onClick={() => toggleExpand(it.id)}
                className="col-span-11 grid grid-cols-11 gap-2 text-left"
              >
                <div className="col-span-2 self-center text-xs text-muted-foreground">{fmt(it.createdAt)}</div>
                <div className="col-span-2 truncate self-center font-medium">{it.name}</div>
                <div className="col-span-3 truncate self-center text-muted-foreground">{it.email}</div>
                <div className="col-span-2 truncate self-center">{it.serviceName ?? it.serviceId ?? "Other"}</div>
                <div className="col-span-2 self-center">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusPill(it.status)}`}>
                    {it.status}
                  </span>
                </div>
              </button>

              <div className="col-span-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                {!archivedMode ? (
                  <IconButton
                    title="Archive inquiry"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await onArchive(it.id);
                    }}
                  >
                    <ArchiveIcon />
                  </IconButton>
                ) : (
                  <>
                    <IconButton
                      title="Restore inquiry"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await onRestore(it.id);
                      }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <IconButton
                      title="Delete forever"
                      tone="danger"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await onDeleteForever(it.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </div>
              </div>
            </div>

            {expanded ? (
              <InquiryExpandedCard
                inquiry={it}
                archivedMode={archivedMode}
                notesValue={notesMap[it.id] ?? it.adminNotes ?? ""}
                onNotesChange={(value) => setNote(it.id, value)}
                onSaveNotes={() => onSaveNotes(it.id)}
                onStatusChange={(status) => onStatusChange(it.id, status)}
                onArchive={() => onArchive(it.id)}
                onRestore={() => onRestore(it.id)}
                onDeleteForever={() => onDeleteForever(it.id)}
              />
            ) : null}
          </div>
        );
      })}

      {list.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No items.</div> : null}
      </div>
      </div>
    </div>
  );
}