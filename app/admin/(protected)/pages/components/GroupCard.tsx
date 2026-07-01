"use client";

import type { LucideIcon } from "lucide-react";

export type GroupTint = "visibility" | "header" | "seo" | "sections";

const TINTS: Record<GroupTint, string> = {
  visibility: "border-sky-500/20 bg-sky-500/5",
  header: "border-violet-500/20 bg-violet-500/5",
  seo: "border-amber-500/20 bg-amber-500/5",
  sections: "border-emerald-500/20 bg-emerald-500/5",
};

const ICON_TINTS: Record<GroupTint, string> = {
  visibility: "text-sky-600 dark:text-sky-400",
  header: "text-violet-600 dark:text-violet-400",
  seo: "text-amber-600 dark:text-amber-400",
  sections: "text-emerald-600 dark:text-emerald-400",
};

export function GroupCard({
  icon: Icon,
  label,
  tint,
  children,
}: {
  icon: LucideIcon;
  label: string;
  tint: GroupTint;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-3 rounded-2xl border p-4 ${TINTS[tint]}`}>
      <p
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${ICON_TINTS[tint]}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      {children}
    </div>
  );
}
