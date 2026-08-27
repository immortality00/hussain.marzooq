"use client";

import { Check, Minus } from "lucide-react";

export function BulkCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }}
      className={[
        "inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        on ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40",
        className,
      ].join(" ")}
    >
      {indeterminate ? (
        <Minus className="size-3.5" strokeWidth={3} />
      ) : checked ? (
        <Check className="size-3.5" strokeWidth={3} />
      ) : null}
    </button>
  );
}
