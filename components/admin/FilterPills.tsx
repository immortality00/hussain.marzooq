"use client";

import { cn } from "@/lib/utils";

export type FilterPill<V extends string> = { value: V; label: string };

// A row of admin filter pills (Testimonials' All / Pending / Approved, the blog's statuses): one is current.
export function FilterPills<V extends string>({
  options,
  value,
  onChange,
  disabled,
  label,
}: {
  options: readonly FilterPill<V>[];
  value: V;
  onChange: (value: V) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "hm-press hm-press-quick rounded-full border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60",
            value === option.value ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-accent"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
