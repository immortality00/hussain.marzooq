"use client";

import { adminButtonClasses } from "@/components/admin/AdminButton";

type BusyAction = "load" | "save" | "delete" | null;

// The media wizard's button row. A new upload steps through in order and saves on the last step; an item
// being edited can be updated from any step (Update is the main button, Next steps on), and deleted on Review.
export function MediaWizardActions({
  editing,
  isFirst,
  isLast,
  busy,
  busyAction,
  blockedReason,
  onBack,
  onNext,
  onSave,
  onDelete,
}: {
  editing: boolean;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  busyAction: BusyAction;
  blockedReason: string | null;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const saving = busyAction === "save";
  const saveLabel = editing ? (saving ? "Updating…" : "Update") : saving ? "Creating…" : "Save";

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button type="button" disabled={isFirst} onClick={onBack} className={adminButtonClasses("default", "md")}>
        Back
      </button>

      {!isLast ? (
        <button
          type="button"
          disabled={Boolean(blockedReason)}
          onClick={onNext}
          className={adminButtonClasses(editing ? "default" : "solid", "md")}
        >
          Next
        </button>
      ) : null}

      {editing || isLast ? (
        <button type="button" disabled={busy} onClick={onSave} className={adminButtonClasses("solid", "md")}>
          {saveLabel}
        </button>
      ) : null}

      {editing && isLast ? (
        <button type="button" disabled={busy} onClick={onDelete} className={adminButtonClasses("danger", "md")}>
          {busyAction === "delete" ? "Deleting…" : "Delete"}
        </button>
      ) : null}

      {blockedReason ? <span className="text-xs text-muted-foreground">{blockedReason}</span> : null}
    </div>
  );
}
