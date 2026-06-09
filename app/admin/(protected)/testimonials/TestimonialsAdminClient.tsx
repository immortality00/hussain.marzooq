"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type TestimonialItem = {
  id: string;
  name: string;
  email: string | null;
  about: string | null;
  location: string | null;
  review: string;
  rating: number;
  profilePhotoUrl: string | null;
  photoUrls: string[];
  isApproved: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type Banner = { type: "ok" | "err" | "info"; text: string } | null;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function identityLine(item: TestimonialItem) {
  return [item.about, item.location].filter(Boolean).join(" • ");
}

function Avatar({ name, profilePhotoUrl }: { name: string; profilePhotoUrl: string | null }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted/55 ring-1 ring-border/60">
      {profilePhotoUrl ? (
        <Image src={profilePhotoUrl} alt={name} fill className="object-cover" sizes="56px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function StatusPill({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ${
        approved
          ? "bg-green-500/10 text-green-700 ring-green-500/20 dark:text-green-300"
          : "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300"
      }`}
    >
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

function ReviewPhotos({ item }: { item: TestimonialItem }) {
  if (item.photoUrls.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
        No extra photos attached to this review.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {item.photoUrls.map((url, index) => (
        <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-muted/50">
          <Image
            src={url}
            alt={`${item.name} submitted photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="260px"
          />
        </div>
      ))}
    </div>
  );
}

function ProcessingPill() {
  return (
    <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
      Processing
    </span>
  );
}

function InspectModal({
  item,
  updating,
  deleting,
  onSetApproval,
  onDelete,
  onClose,
}: {
  item: TestimonialItem;
  updating: boolean;
  deleting: boolean;
  onSetApproval: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const metaLine = identityLine(item);

  return (
    <div className="fixed inset-0 z-50 bg-black/72 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-background shadow-2xl ring-1 ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">{item.name}</h2>
              {deleting ? <ProcessingPill /> : null}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Submitted {formatDate(item.createdAt)}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.isApproved ? (
              <button
                type="button"
                disabled={updating || deleting}
                onClick={() => onSetApproval(item.id, false)}
                className="rounded-xl border border-amber-500/30 px-4 py-2 text-sm text-amber-700 hover:bg-amber-500/10 disabled:opacity-60 dark:text-amber-300"
              >
                Unapprove
              </button>
            ) : (
              <button
                type="button"
                disabled={updating || deleting}
                onClick={() => onSetApproval(item.id, true)}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
              >
                Approve
              </button>
            )}

            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(item.id)}
              className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-60 dark:text-red-300"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-border/60 px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="space-y-5">
              <section className="rounded-[1.6rem] border border-border/60 p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold tracking-[-0.02em]">{item.name}</div>
                      <StatusPill approved={item.isApproved} />
                    </div>

                    {metaLine ? <div className="mt-1 text-sm text-muted-foreground">{metaLine}</div> : null}

                    <div className="mt-1 text-sm text-muted-foreground">{item.email ?? "No email"}</div>
                    <div className="mt-3 text-xl text-amber-400">{renderStars(item.rating)}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-border/60 p-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-right">{formatDate(item.createdAt)}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="text-right">{formatDate(item.updatedAt)}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Attached photos</dt>
                    <dd>{item.photoUrls.length}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-[1.6rem] border border-border/60 bg-muted/20 p-5">
                <blockquote className="whitespace-pre-wrap text-2xl leading-10 tracking-[-0.04em] text-foreground">
                  “{item.review}”
                </blockquote>
              </section>

              <section>
                <ReviewPhotos item={item} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  item,
  updating,
  deleting,
  onInspect,
  onSetApproval,
  onDelete,
}: {
  item: TestimonialItem;
  updating: boolean;
  deleting: boolean;
  onInspect: (item: TestimonialItem) => void;
  onSetApproval: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const metaLine = identityLine(item);

  return (
    <article
      className={`rounded-[1.6rem] bg-background/78 p-4 ring-1 ring-border/45 transition-opacity ${
        deleting ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <button type="button" onClick={() => onInspect(item)} className="min-w-0 text-left">
          <div className="flex gap-4">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-medium">{item.name}</div>
                <StatusPill approved={item.isApproved} />
                {deleting ? <ProcessingPill /> : null}
              </div>

              {metaLine ? <div className="mt-1 text-xs text-muted-foreground">{metaLine}</div> : null}

              <div className="mt-1 text-xs text-muted-foreground">{item.email || "No email"}</div>
              <div className="mt-2 text-sm text-amber-400">{renderStars(item.rating)}</div>

              <div className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.review}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  {item.photoUrls.length} photo{item.photoUrls.length === 1 ? "" : "s"}
                </span>
                <span>·</span>
                <span>Submitted {formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onInspect(item)}
            disabled={deleting}
            className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
          >
            Inspect
          </button>

          {item.isApproved ? (
            <button
              type="button"
              disabled={updating || deleting}
              onClick={() => onSetApproval(item.id, false)}
              className="rounded-xl border border-amber-500/30 px-3 py-2 text-sm text-amber-700 hover:bg-amber-500/10 disabled:opacity-60 dark:text-amber-300"
            >
              Unapprove
            </button>
          ) : (
            <button
              type="button"
              disabled={updating || deleting}
              onClick={() => onSetApproval(item.id, true)}
              className="rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
            >
              Approve
            </button>
          )}

          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(item.id)}
            className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-60 dark:text-red-300"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsAdminClient() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved">("all");
  const [active, setActive] = useState<TestimonialItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const approved = items.filter((item) => item.isApproved).length;
    const pending = items.length - approved;
    const withPhotos = items.filter((item) => item.photoUrls.length > 0).length;
    const locations = new Set(items.map((item) => item.location?.trim()).filter(Boolean)).size;

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
    const ok = confirm("Delete this submitted review permanently?");
    if (!ok) return;

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

      if (active?.id === id) {
        setActive(null);
      }
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    } finally {
      setDeletingId(null);
    }
  }

  async function setApproval(id: string, value: boolean) {
    setBanner(null);
    setUpdatingId(id);

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

      setBanner({
        type: "ok",
        text: value ? "✅ Review approved." : "Review moved back to pending.",
      });
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
          <div className="rounded-[1.4rem] border border-border/60 p-4">
            <div className="text-2xl font-semibold tracking-[-0.05em]">{stats.pending}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Pending</div>
          </div>

          <div className="rounded-[1.4rem] border border-border/60 p-4">
            <div className="text-2xl font-semibold tracking-[-0.05em]">{stats.approved}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Approved</div>
          </div>

          <div className="rounded-[1.4rem] border border-border/60 p-4">
            <div className="text-2xl font-semibold tracking-[-0.05em]">{stats.locations}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Locations</div>
          </div>

          <div className="rounded-[1.4rem] border border-border/60 p-4">
            <div className="text-2xl font-semibold tracking-[-0.05em]">{stats.withPhotos}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">With photos</div>
          </div>
        </div>
      </div>

      {banner ? (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ring-1 ${
            banner.type === "ok"
              ? "bg-green-500/10 text-foreground ring-green-500/20"
              : banner.type === "info"
                ? "bg-sky-500/10 text-foreground ring-sky-500/20"
                : "bg-red-500/10 text-foreground ring-red-500/20"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <section className="mt-6 rounded-[2rem] border border-border/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-full border px-4 py-2 text-sm capitalize ${
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, review, location..."
            className="w-full max-w-sm rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
        <InspectModal
          item={active}
          updating={updatingId === active.id}
          deleting={deletingId === active.id}
          onSetApproval={(id, value) => void setApproval(id, value)}
          onDelete={(id) => void remove(id)}
          onClose={() => setActive(null)}
        />
      ) : null}
    </main>
  );
}