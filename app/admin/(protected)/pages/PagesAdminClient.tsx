"use client";

import Link from "next/link";
import type { PageSettings } from "@/lib/server/page-settings";
import type { PageSeo } from "@/lib/server/page-seo";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { usePagesAdmin } from "./usePagesAdmin";
import { PAGE_ROWS, pageGroup, type PageRow, type PageGroup } from "./lib/rows";

const GROUPS: { key: PageGroup; label: string }[] = [
  { key: "main", label: "Main pages" },
  { key: "discipline", label: "Disciplines" },
  { key: "template", label: "Templates" },
];

export function PagesAdminClient({
  initialSettings,
  initialSeo,
  initialSections,
}: {
  initialSettings: PageSettings[];
  initialSeo: PageSeo[];
  initialSections: { slug: PageSectionsSlug; data: PageSectionsMap[PageSectionsSlug] }[];
}) {
  const admin = usePagesAdmin({ initialSettings, initialSeo, initialSections });

  return (
    <div>
      <AdminPageHeader title="Pages" className="mb-8" />

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const rows = PAGE_ROWS.filter((row) => pageGroup(row) === group.key);
          if (rows.length === 0) return null;
          return (
            <section key={group.key}>
              <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                  <PageCard
                    key={row.key}
                    row={row}
                    isActive={admin.isActiveOf(row)}
                    toggling={admin.togglingSlug === row.settingsSlug}
                    onToggle={() => admin.toggleVisibility(row)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AdminActionFeedback feedback={admin.feedback} />
    </div>
  );
}

function PageCard({
  row,
  isActive,
  toggling,
  onToggle,
}: {
  row: PageRow;
  isActive: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const hasToggle = Boolean(row.settingsSlug);
  return (
    <div className="group relative flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/40">
      <Link
        href={`/admin/pages/${row.key}`}
        aria-label={`Edit ${row.label}`}
        className="absolute inset-0 rounded-2xl"
      />
      <span
        className={`text-sm font-medium leading-snug transition-colors ${
          hasToggle && !isActive ? "text-muted-foreground" : ""
        }`}
      >
        {row.label}
      </span>
      {hasToggle && (
        <AdminToggle
          checked={isActive}
          onChange={onToggle}
          disabled={toggling}
          label={`Toggle ${row.label} visibility`}
          className="relative z-10"
        />
      )}
    </div>
  );
}
