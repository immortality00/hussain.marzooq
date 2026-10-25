"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { STATUSES } from "../lib/types";
import { adminInputClasses } from "@/components/admin/admin-input";

export default function InquiriesToolbar({
  statusFilter,
  setStatusFilter,
  counts,
  onRefresh,
}: {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  counts: Map<string, number>;
  onRefresh: () => void | Promise<void>;
}) {
  return (
    <>
      <AdminPageHeader title="Inquiries" description="Active on top, archived below." />

      <StickyToolbar surface="admin" className="mt-6 [--sticky-bleed:0.75rem] md:[--sticky-bleed:2.75rem]">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={adminInputClasses("md", "w-auto")}
          >
            <option value="">All active statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({counts.get(s) ?? 0})
              </option>
            ))}
          </select>

          <button className={adminButtonClasses("default", "md")} onClick={() => void onRefresh()}>
            Refresh
          </button>
        </div>
      </StickyToolbar>
    </>
  );
}
