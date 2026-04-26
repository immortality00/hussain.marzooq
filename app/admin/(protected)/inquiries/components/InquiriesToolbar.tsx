"use client";

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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Inquiries</h1>
        <p className="mt-2 text-sm text-muted-foreground">Active on top, archived below.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}