"use client";

import { STATUSES, type Inquiry } from "../lib/types";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export default function InquiryExpandedCard({
  inquiry,
  archivedMode,
  notesValue,
  onNotesChange,
  onSaveNotes,
  onStatusChange,
  onArchive,
  onRestore,
  onDeleteForever,
}: {
  inquiry: Inquiry;
  archivedMode: boolean;
  notesValue: string;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void | Promise<void>;
  onStatusChange: (status: string) => void | Promise<void>;
  onArchive: () => void | Promise<void>;
  onRestore: () => void | Promise<void>;
  onDeleteForever: () => void | Promise<void>;
}) {
  return (
    <div className="px-4 pb-4">
      <div className="grid gap-4 rounded-2xl border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="text-sm">
            <div className="text-xs text-muted-foreground">Category</div>
            <div className="font-medium">{inquiry.category ?? "others"}</div>
          </div>
          <div className="text-sm">
            <div className="text-xs text-muted-foreground">ServiceId</div>
            <div className="break-all font-mono text-xs text-muted-foreground">{inquiry.serviceId ?? "-"}</div>
          </div>
        </div>

        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Message</div>
          <div className="whitespace-pre-wrap rounded-xl border bg-muted/25 px-3 py-3">{inquiry.message}</div>
        </div>

        {!archivedMode ? (
          <div className="text-sm">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={adminButtonClasses("default", "md", inquiry.status === s ? "bg-accent" : "")}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await onStatusChange(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Internal notes</div>

          <textarea
            value={notesValue}
            onChange={(e) => onNotesChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="mt-2 h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className={adminButtonClasses("default", "md")}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await onSaveNotes();
              }}
            >
              Save notes
            </button>

            {!archivedMode ? (
              <button
                className={adminButtonClasses("default", "md")}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await onArchive();
                }}
              >
                Archive
              </button>
            ) : (
              <>
                <button
                  className={adminButtonClasses("default", "md")}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await onRestore();
                  }}
                >
                  Restore
                </button>

                <button
                  className={adminButtonClasses("danger", "md")}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await onDeleteForever();
                  }}
                >
                  Delete forever
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}