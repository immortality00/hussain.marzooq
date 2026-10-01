"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { useTestimonialActions } from "./lib/useTestimonialActions";
import { ReviewRow } from "./components/TestimonialList";
import { TestimonialInspectModal } from "./components/TestimonialForm";
import { adminInputClasses } from "@/components/admin/admin-input";

export default function TestimonialsAdminClient() {
  const {
    filtered,
    stats,
    search,
    setSearch,
    status,
    setStatus,
    banner,
    active,
    setActive,
    updatingId,
    deletingId,
    actionBusy,
    selection,
    bulkBusy,
    setApproval,
    remove,
    bulkSetApproval,
    bulkDelete,
  } = useTestimonialActions();

  return (
    <main className="mx-auto max-w-7xl px-0 pb-10 pt-3 md:px-6 md:pt-4">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.06em]">Testimonials</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {([
            { label: "Pending", value: stats.pending },
            { label: "Approved", value: stats.approved },
            { label: "Locations", value: stats.locations },
            { label: "With photos", value: stats.withPhotos },
          ] as const).map(({ label, value }) => (
            <div key={label} className="rounded-[1.4rem] border border-border/60 p-4">
              <div className="text-2xl font-semibold tracking-[-0.05em]">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <AdminActionFeedback feedback={banner} />

      <section className="mt-6 rounded-[2rem] border border-border/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved"] as const).map((value) => (
              <button
                key={value}
                type="button"
                disabled={actionBusy}
                onClick={() => setStatus(value)}
                className={`rounded-full border px-4 py-2 text-sm capitalize disabled:cursor-not-allowed disabled:opacity-60 ${
                  status === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 hover:bg-accent"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <input
            value={search}
            disabled={actionBusy}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, review, location..."
            className={adminInputClasses("md", "max-w-sm")}
          />
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
            <BulkCheckbox
              checked={selection.allSelected}
              indeterminate={selection.count > 0 && !selection.allSelected}
              onChange={selection.toggleAll}
              label="Select all reviews"
            />
            Select all
          </div>
        )}

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
              No reviews match this view.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <BulkCheckbox
                  checked={selection.isSelected(item.id)}
                  onChange={() => selection.toggle(item.id)}
                  label={`Select ${item.name}`}
                  className="mt-4"
                />
                <div className="min-w-0 flex-1">
                  <ReviewRow
                    item={item}
                    updating={updatingId === item.id}
                    deleting={deletingId === item.id}
                    onInspect={setActive}
                    onSetApproval={(id, value) => void setApproval(id, value)}
                    onDelete={(id) => void remove(id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Approve", onRun: () => bulkSetApproval(true) },
          { label: "Unapprove", onRun: () => bulkSetApproval(false) },
          { label: "Delete", tone: "danger", onRun: bulkDelete },
        ]}
      />

      {active ? (
        <TestimonialInspectModal
          item={active}
          updating={updatingId === active.id}
          deleting={deletingId === active.id}
          onSetApproval={(id, value) => void setApproval(id, value)}
          onDelete={(id) => void remove(id)}
          onClose={() => { if (!actionBusy) setActive(null); }}
        />
      ) : null}
    </main>
  );
}
