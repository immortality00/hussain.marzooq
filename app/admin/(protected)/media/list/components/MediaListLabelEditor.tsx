"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export function MediaListLabelEditor({
  busy,
  dirty,
  onCancel,
  onSave,
  children,
}: {
  busy: boolean;
  dirty: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLFieldSetElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <fieldset ref={ref} tabIndex={-1} disabled={busy} className="mt-3 min-w-0 space-y-3 outline-none">
      {children}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={adminButtonClasses("default", "sm")}>
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={!dirty} className={adminButtonClasses("solid", "sm")}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </fieldset>
  );
}
