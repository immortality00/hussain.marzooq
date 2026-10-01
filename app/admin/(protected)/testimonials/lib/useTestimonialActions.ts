"use client";

import { useMemo, useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useBulkRunner } from "@/components/admin/bulk/useBulkRunner";
import { adminWrite } from "@/lib/client/admin-store";
import type { TestimonialItem } from "../components/TestimonialShared";

async function send(id: string, init: RequestInit, fallback: string) {
  const res = await adminWrite(`/api/testimonials/${encodeURIComponent(id)}`, init, ["testimonials"]);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? fallback);
}

const approve = (id: string, value: boolean) =>
  send(
    id,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved: value }) },
    "Update failed."
  );

const removeReview = (id: string) => send(id, { method: "DELETE" }, "Delete failed.");

function matches(item: TestimonialItem, status: ReviewFilter, query: string) {
  if (status === "approved" && !item.isApproved) return false;
  if (status === "pending" && item.isApproved) return false;
  if (!query) return true;
  return `${item.name} ${item.email ?? ""} ${item.about ?? ""} ${item.location ?? ""} ${item.review}`
    .toLowerCase()
    .includes(query);
}

export type ReviewFilter = "all" | "pending" | "approved";

export function useTestimonialActions() {
  const [items, setItems] = useAdminSlice("testimonials");
  const { feedback: banner, setFeedback: setBanner } = useAdminAction();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewFilter>("all");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => matches(item, status, query));
  }, [items, search, status]);
  const stats = useMemo(() => {
    const approved = items.filter((i) => i.isApproved).length;
    return {
      approved,
      pending: items.length - approved,
      withPhotos: items.filter((i) => i.photoUrls.length > 0).length,
      locations: new Set(items.map((i) => i.location?.trim()).filter(Boolean)).size,
    };
  }, [items]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const labelOf = (id: string) => items.find((item) => item.id === id)?.name || "Review";
  const bulk = useBulkRunner(filtered.map((item) => item.id), labelOf, setBanner);

  const actionBusy = Boolean(updatingId || deletingId);
  const active = items.find((item) => item.id === activeId) ?? null;
  const markApproved = (ids: string[], value: boolean) =>
    setItems((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, isApproved: value } : item)));
  const drop = (ids: string[]) => setItems((prev) => prev.filter((item) => !ids.includes(item.id)));

  async function track(setId: (id: string | null) => void, id: string, busyText: string, work: () => Promise<string>) {
    setId(id);
    setBanner({ type: "info", text: busyText });
    try {
      setBanner({ type: "ok", text: await work() });
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorMessage(e, "Action failed.") });
    } finally {
      setId(null);
    }
  }

  function setApproval(id: string, value: boolean) {
    if (actionBusy) return;
    return track(setUpdatingId, id, value ? "Approving review…" : "Moving review back to pending…", async () => {
      await approve(id, value);
      markApproved([id], value);
      return value ? "✅ Review approved." : "✅ Review moved back to pending.";
    });
  }

  function remove(id: string) {
    if (actionBusy || !confirm("Delete this submitted review permanently?")) return;
    return track(setDeletingId, id, "Deleting review and cleaning Cloudinary assets…", async () => {
      await removeReview(id);
      drop([id]);
      if (activeId === id) setActiveId(null);
      return "✅ Review deleted and Cloudinary cleanup finished.";
    });
  }

  const bulkSetApproval = (value: boolean) =>
    bulk.run(
      value ? "Approving selected…" : "Unapproving selected…",
      value ? "approved" : "moved to pending",
      (id) => approve(id, value),
      (okIds) => markApproved(okIds, value)
    );

  function bulkDelete() {
    if (!confirm(`Delete ${bulk.selection.count} review(s) permanently?`)) return;
    return bulk.run("Deleting selected reviews…", "deleted", removeReview, drop);
  }

  return {
    filtered,
    stats,
    search,
    setSearch,
    status,
    setStatus,
    banner,
    active,
    setActive: (item: TestimonialItem | null) => setActiveId(item?.id ?? null),
    updatingId,
    deletingId,
    actionBusy,
    selection: bulk.selection,
    bulkBusy: bulk.busy,
    setApproval,
    remove,
    bulkSetApproval,
    bulkDelete,
  };
}
