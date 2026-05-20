"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

type WidgetResult = { info?: unknown };

type TestimonialItem = {
  id: string;
  name: string;
  about: string | null;
  review: string;
  rating: number;
  photoUrls: string[];
  featured: boolean;
  isApproved: boolean;
  sortOrder: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function StarPicker({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (value: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setRating(value)}
          className={`text-2xl transition-transform hover:scale-110 ${
            value <= rating ? "text-amber-400" : "text-muted-foreground/30"
          }`}
          aria-label={`Set ${value} star rating`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsAdminClient() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [sortOrder, setSortOrder] = useState("100");

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
      `${item.name} ${item.about ?? ""} ${item.review}`.toLowerCase().includes(q)
    );
  }, [items, search]);

  function resetForm() {
    setEditingId("");
    setName("");
    setAbout("");
    setReview("");
    setRating(5);
    setPhotoUrls([]);
    setFeatured(false);
    setIsApproved(true);
    setSortOrder("100");
  }

  function openNew() {
    resetForm();
    setView("form");
  }

  function openEdit(item: TestimonialItem) {
    setEditingId(item.id);
    setName(item.name);
    setAbout(item.about ?? "");
    setReview(item.review);
    setRating(item.rating);
    setPhotoUrls(item.photoUrls ?? []);
    setFeatured(item.featured);
    setIsApproved(item.isApproved);
    setSortOrder(String(item.sortOrder));
    setView("form");
  }

  function backToList() {
    resetForm();
    setView("list");
  }

  async function save() {
    setBanner(null);

    if (!name.trim()) {
      setBanner({ type: "err", text: "Name is required." });
      return;
    }

    if (!review.trim()) {
      setBanner({ type: "err", text: "Review is required." });
      return;
    }

    try {
      const res = await fetch(editingId ? `/api/testimonials/${encodeURIComponent(editingId)}` : "/api/testimonials", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          about,
          review,
          rating,
          photoUrls,
          featured,
          isApproved,
          sortOrder: Number(sortOrder) || 100,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Save failed." });
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Review updated." : "✅ Review created." });
      await load();
      backToList();
    } catch {
      setBanner({ type: "err", text: "Save failed." });
    }
  }

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

      if (editingId === id) backToList();
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    }
  }

  async function quickToggle(id: string, patch: { isApproved?: boolean; featured?: boolean }) {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    try {
      const res = await fetch(`/api/testimonials/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: current.name,
          about: current.about ?? "",
          review: current.review,
          rating: current.rating,
          photoUrls: current.photoUrls,
          featured: patch.featured ?? current.featured,
          isApproved: patch.isApproved ?? current.isApproved,
          sortOrder: current.sortOrder,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Update failed." });
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                featured: patch.featured ?? item.featured,
                isApproved: patch.isApproved ?? item.isApproved,
              }
            : item
        )
      );
    } catch {
      setBanner({ type: "err", text: "Update failed." });
    }
  }

  function addPhoto(url: string) {
    setPhotoUrls((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url].slice(0, 12);
    });
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((item) => item !== url));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage public reviews in a cleaner review-style format.
          </p>
        </div>

        {view === "list" ? (
          <button
            type="button"
            onClick={openNew}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            New review
          </button>
        ) : (
          <button
            type="button"
            onClick={backToList}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Back to list
          </button>
        )}
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      {view === "list" ? (
        <section className="mt-8 rounded-[2rem] border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Reviews</div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No reviews yet.</div>
            ) : (
              filtered.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[2rem] border p-4 ${item.featured ? "ring-1 ring-foreground/20" : ""}`}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="min-w-0 flex gap-4">
                      {item.photoUrls.length > 0 ? (
                        <div className="grid w-32 shrink-0 grid-cols-2 gap-2">
                          {item.photoUrls.slice(0, 2).map((url) => (
                            <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                              <Image src={url} alt={item.name} fill className="object-contain" sizes="160px" />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium">{item.name}</div>
                          {item.featured ? (
                            <span className="rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                              Featured
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.about || "Client"}
                        </div>

                        <div className="mt-2 text-sm text-amber-400">
                          {Array.from({ length: item.rating }).map(() => "★").join("")}
                        </div>

                        <div className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {item.review}
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-[190px] flex-col gap-3 lg:items-end">
                      <div className="flex flex-col gap-3 rounded-[1.25rem] border p-3">
                        <label className="flex items-center justify-between gap-3 text-sm">
                          <span>Approved</span>
                          <input
                            type="checkbox"
                            checked={item.isApproved}
                            onChange={(e) => void quickToggle(item.id, { isApproved: e.target.checked })}
                          />
                        </label>

                        <label className="flex items-center justify-between gap-3 text-sm">
                          <span>Featured</span>
                          <input
                            type="checkbox"
                            checked={item.featured}
                            onChange={(e) => void quickToggle(item.id, { featured: e.target.checked })}
                          />
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(item.id)}
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 mx-auto max-w-3xl rounded-[2rem] border p-6">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stars *</label>
                <div className="rounded-xl border px-4 py-2">
                  <StarPicker rating={rating} setRating={setRating} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">About you</label>
              <input
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review *</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-40 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photos</label>

              <div className="flex flex-wrap gap-2">
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  options={{
                    folder: "hm_visuals/testimonials",
                    multiple: true,
                    maxFiles: 12,
                    resourceType: "image",
                  }}
                  onSuccess={(result: unknown) => {
                    const info = (result as WidgetResult)?.info;
                    if (!isRecord(info)) return;
                    const secureUrl = getString(info.secure_url);
                    if (secureUrl) addPhoto(secureUrl);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      Upload photos
                    </button>
                  )}
                </CldUploadWidget>

                {photoUrls.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPhotoUrls([])}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>

              {photoUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photoUrls.map((url) => (
                    <div key={url} className="space-y-2">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                        <Image src={url} alt="Review upload" fill className="object-contain" sizes="180px" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        className="w-full rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Optional</div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort order</label>
                <input
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Featured
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isApproved} onChange={(e) => setIsApproved(e.target.checked)} />
                Approved
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                {editingId ? "Update review" : "Create review"}
              </button>

              <button
                type="button"
                onClick={backToList}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}