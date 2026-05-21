"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function Avatar({ name, profilePhotoUrl }: { name: string; profilePhotoUrl: string | null }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted/55">
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

export default function TestimonialsAdminClient() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<TestimonialItem | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.email ?? ""} ${item.about ?? ""} ${item.location ?? ""} ${item.review}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  async function remove(id: string) {
    const ok = confirm("Delete this review?");
    if (!ok) return;

    setBanner(null);
    try {
      const res = await fetch(`/api/testimonials/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };

      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({ type: "ok", text: "✅ Review deleted." });

      if (active?.id === id) setActive(null);
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    }
  }

  async function quickApprove(id: string, value: boolean) {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    try {
      const res = await fetch(`/api/testimonials/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: current.name,
          email: current.email ?? "",
          about: current.about ?? "",
          location: current.location ?? "",
          review: current.review,
          rating: current.rating,
          profilePhotoUrl: current.profilePhotoUrl ?? "",
          photoUrls: current.photoUrls,
          isApproved: value,
          sortOrder: current.sortOrder,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Update failed." });
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isApproved: value } : item))
      );
    } catch {
      setBanner({ type: "err", text: "Update failed." });
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inspect, approve, or delete submitted reviews.
        </p>
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ring-1 ${
            banner.type === "ok"
              ? "bg-green-500/10 text-foreground ring-green-500/20"
              : "bg-red-500/10 text-foreground ring-red-500/20"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <section className="mt-8 rounded-[2rem] border border-border/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Reviews</div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full max-w-xs rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
              No reviews yet.
            </div>
          ) : (
            filtered.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] bg-background/78 p-4 ring-1 ring-border/45">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <button type="button" onClick={() => setActive(item)} className="min-w-0 text-left">
                    <div className="flex gap-4">
                      <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {[item.about, item.location].filter(Boolean).join(" • ") || "Client"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.email || "No email"}
                        </div>
                        <div className="mt-2 text-sm text-amber-400">
                          {Array.from({ length: item.rating }, () => "★").join("")}
                        </div>
                        <div className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {item.review}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex min-w-[180px] flex-col gap-3 lg:items-end">
                    <div className="w-full rounded-[1.1rem] border border-border/60 p-3 lg:w-[180px]">
                      <label className="flex items-center justify-between gap-3 text-sm">
                        <span>Approved</span>
                        <input
                          type="checkbox"
                          checked={item.isApproved}
                          onChange={(e) => void quickApprove(item.id, e.target.checked)}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => void remove(item.id)}
                      className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {active ? (
        <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={() => setActive(null)}>
          <div
            className="mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-[2rem] bg-background shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end border-b border-border/50 p-5">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <Avatar name={active.name} profilePhotoUrl={active.profilePhotoUrl} />

                    <div className="min-w-0">
                      <div className="text-xl font-semibold tracking-tight">{active.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {[active.about, active.location].filter(Boolean).join(" • ") || "Client"}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {active.email || "No email"}
                      </div>
                      <div className="mt-3 text-2xl text-amber-400">
                        {Array.from({ length: active.rating }, () => "★").join("")}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-background/85 p-5 ring-1 ring-border/45">
                    <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                      {active.review}
                    </div>
                  </div>
                </div>

                <div>
                  {active.photoUrls.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {active.photoUrls.map((url) => (
                        <div
                          key={url}
                          className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[1.1rem] bg-muted/50"
                        >
                          <Image
                            src={url}
                            alt={active.name}
                            fill
                            className="object-contain"
                            sizes="420px"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-background/85 p-6 text-sm text-muted-foreground ring-1 ring-border/45">
                      No photos attached to this review.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}