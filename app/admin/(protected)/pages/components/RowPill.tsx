"use client";

// Small status pill shown on a collapsed page row (e.g. "Unsaved", "Needs image").
export function RowPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">
      {label}
    </span>
  );
}
