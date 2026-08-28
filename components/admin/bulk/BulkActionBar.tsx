"use client";

import { X } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export type BulkAction = {
  label: string;
  onRun: () => void | Promise<void>;
  tone?: "default" | "danger";
};

export function BulkActionBar({
  count,
  actions,
  busy = false,
  onClear,
}: {
  count: number;
  actions: BulkAction[];
  busy?: boolean;
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-30 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className={adminButtonClasses("default", "xs", "size-7")}
      >
        <X className="size-4" />
      </button>

      <span className="font-mono text-sm tabular-nums">
        {count} selected
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={busy}
            onClick={() => void action.onRun()}
            className={adminButtonClasses(action.tone === "danger" ? "danger" : "default", "sm")}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
