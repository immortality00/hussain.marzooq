"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { STATUSES } from "../lib/types";

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
    <AdminPageHeader
      title="Inquiries"
      description="Active on top, archived below."
      actions={
        <>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="">All active statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({counts.get(s) ?? 0})
              </option>
            ))}
          </select>

          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-accent" onClick={() => void onRefresh()}>
            Refresh
          </button>
        </>
      }
    />
  );
}