"use client";

import { Check, ChevronRight, type LucideIcon } from "lucide-react";
import { AdminLink } from "@/components/admin/AdminLink";

export function AttentionRow({
  icon: Icon,
  label,
  count,
  href,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  href: string;
}) {
  const active = count > 0;
  return (
    <AdminLink
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
    >
      <span
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl border ${
          active ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      <span
        className={`font-mono text-2xl font-semibold tabular-nums ${
          active ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/60"
        }`}
      >
        {count}
      </span>
      {active ? (
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      ) : (
        <Check className="size-4 text-muted-foreground/50" />
      )}
    </AdminLink>
  );
}

export function LibraryTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <AdminLink
      href={href}
      className="rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <Icon className="size-4 text-muted-foreground" />
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </AdminLink>
  );
}
