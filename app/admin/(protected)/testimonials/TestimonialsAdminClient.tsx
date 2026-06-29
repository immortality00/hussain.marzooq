"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";
import type { TestimonialItem } from "./components/TestimonialShared";
import { ReviewRow } from "./components/TestimonialList";
import { TestimonialInspectModal } from "./components/TestimonialForm";

export default function TestimonialsAdminClient() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<AdminActionFeedbackState>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved">("all");
  const [active, setActive] = useState<TestimonialItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const actionBusy = Boolean(updatingId || deletingId);

  async function load() {
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: TestimonialItem[];
        error?: string;
      };
      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load testimonials." });
        return;
      }
      setItems(data.items);
    } catch {
      setBanner({ type: "err", text: "Failed to load testimonials." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const approved = items.filter((i) => i.isApproved).length;
    const pending = items.length - approved;
    const withPhotos = items.filter((i) => i.photoUrls.length > 0).length;
    const locations = new Set(items.map((i) => i.location?.trim()).filter(Boolean)).size;
    return { approved, pending, withPhotos, locations };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (status === "approved" && !item.isApproved) return false;
      if (status === "pending" && item.isApproved) return false;
      if (!q) return true;
      return `${item.name} ${item.email ?? ""} ${item.about ?? ""} ${item.location ?? ""} ${item.review}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, search, status]);

  function updateItem(id: string, updates: Partial<TestimonialItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    setActive((prev) => (prev?.id === id ? { ...prev, ...updates } : prev));
  }

  async function remove(id: string) {
    if (actionBusy) return;
    if (!confirm("Delete this submitted review permanently?")) return;
    setBanner({ type: "info", text: "Deleting review and cleaning Cloudinary assets…" });
    setDeletingId(id);
    try {
      const res = await fetch(`/api/testimonials/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({ type: "ok", text: "✅ Review deleted and Cloudinary cleanup finished." });
      if (active?.id === id) setActive(null);
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    } finally {
      setDeletingId(null);
    }
  }

  async function setApproval(id: string, value: boolean) {
    if (actionBusy) return;
    setUpdatingId(id);
    setBanner({ type: "info", text: value ? "Approving review…" : "Moving review back to pending…" });
    try {
      const res = await fetch(`/api/testimonials/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: value }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Update failed." });
        return;
      }
      updateItem(id, { isApproved: value, updatedAt: new Date().toISOString() });
      setBanner({ type: "ok", text: value ? "✅ Review approved." : "✅ Review moved back to pending." });
    } catch {
      setBanner({ type: "err", text: "Update failed." });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-10 pt-4">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.06em]">Testimonials</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inspect submitted reviews, approve or unapprove public visibility, or delete reviews that should not be kept.
          </p>
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

      <AdminActionFeedback feedback={banner} className="mt-5" />

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
            className="w-full max-w-sm rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
              No reviews match this view.
            </div>
          ) : (
            filtered.map((item) => (
              <ReviewRow
                key={item.id}
                item={item}
                updating={updatingId === item.id}
                deleting={deletingId === item.id}
                onInspect={setActive}
                onSetApproval={(id, value) => void setApproval(id, value)}
                onDelete={(id) => void remove(id)}
              />
            ))
          )}
        </div>
      </section>

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
