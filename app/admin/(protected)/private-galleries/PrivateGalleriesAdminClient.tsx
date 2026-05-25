"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mediaIds: string[];
  isActive: boolean;
  expiresAtLocal: string;
};

type MediaItem = {
  id: string;
  type: string;
  title: string;
  secureUrl: string | null;
  embedUrl: string | null;
  categories: string[];
  tags: string[];
  location: string | null;
  people: string[];
  event: string | null;
};

function parseLocalDateTime(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getGalleryStatus(item: GalleryItem) {
  const expiry = parseLocalDateTime(item.expiresAtLocal);
  const isExpired = expiry ? expiry.getTime() <= Date.now() : false;

  if (isExpired) {
    return {
      label: "Expired",
      className: "border-red-500/30 bg-red-500/10 text-red-200",
    };
  }

  if (!item.isActive) {
    return {
      label: "Inactive",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    };
  }

  return {
    label: "Active",
    className: "border-green-500/30 bg-green-500/10 text-green-200",
  };
}

function buildGalleryUrl(slug: string) {
  if (typeof window === "undefined") return `/g/${slug}`;
  return `${window.location.origin}/g/${slug}`;
}

export default function PrivateGalleriesAdminClient() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    setBanner(null);
    try {
      const [galleryRes, mediaRes] = await Promise.all([
        fetch("/api/private-galleries", { cache: "no-store" }),
        fetch("/api/media/admin-list?limit=120", { cache: "no-store" }),
      ]);

      const galleryData = (await galleryRes.json().catch(() => null)) as {
        ok?: boolean;
        items?: GalleryItem[];
        error?: string;
      };
      const mediaData = (await mediaRes.json().catch(() => null)) as {
        ok?: boolean;
        items?: MediaItem[];
        error?: string;
      };

      if (!galleryRes.ok || !galleryData?.ok || !Array.isArray(galleryData.items)) {
        setBanner({ type: "err", text: galleryData?.error ?? "Failed to load galleries." });
        return;
      }

      if (!mediaRes.ok || !mediaData?.ok || !Array.isArray(mediaData.items)) {
        setBanner({ type: "err", text: mediaData?.error ?? "Failed to load media." });
        return;
      }

      setItems(galleryData.items);
      setMedia(mediaData.items);
    } catch {
      setBanner({ type: "err", text: "Failed to load private galleries." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId("");
    setTitle("");
    setSlug("");
    setDescription("");
    setPassword("");
    setIsActive(true);
    setExpiresAtLocal("");
    setSelectedMediaIds([]);
  }

  function openNew() {
    resetForm();
    setView("form");
  }

  async function openEdit(id: string) {
    setBanner(null);
    try {
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        item?: GalleryItem;
        error?: string;
      };

      if (!res.ok || !data?.ok || !data.item) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load gallery." });
        return;
      }

      setEditingId(data.item.id);
      setTitle(data.item.title);
      setSlug(data.item.slug);
      setDescription(data.item.description ?? "");
      setPassword("");
      setIsActive(data.item.isActive);
      setExpiresAtLocal(data.item.expiresAtLocal ?? "");
      setSelectedMediaIds(data.item.mediaIds ?? []);
      setView("form");
    } catch {
      setBanner({ type: "err", text: "Failed to load gallery." });
    }
  }

  function backToList() {
    resetForm();
    setView("list");
  }

  async function save() {
    setBanner(null);

    if (!title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    if (!editingId && password.trim().length < 4) {
      setBanner({ type: "err", text: "Password must be at least 4 characters." });
      return;
    }

    if (!expiresAtLocal.trim()) {
      setBanner({ type: "err", text: "Expiry date is required." });
      return;
    }

    if (selectedMediaIds.length === 0) {
      setBanner({ type: "err", text: "Select at least one media item." });
      return;
    }

    try {
      const res = await fetch(
        editingId ? `/api/private-galleries/${encodeURIComponent(editingId)}` : "/api/private-galleries",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            description,
            password,
            isActive,
            expiresAtLocal,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            mediaIds: selectedMediaIds,
          }),
        }
      );

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Save failed." });
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Gallery updated." : "✅ Gallery created." });
      await load();
      backToList();
    } catch {
      setBanner({ type: "err", text: "Save failed." });
    }
  }

  async function remove(id: string) {
    const ok = confirm("Delete this private gallery?");
    if (!ok) return;

    setBanner(null);
    try {
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({ type: "ok", text: "✅ Gallery deleted." });

      if (editingId === id) backToList();
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    }
  }

  async function copyLink(slugValue: string) {
    const url = buildGalleryUrl(slugValue);

    try {
      await navigator.clipboard.writeText(url);
      setBanner({ type: "ok", text: "✅ Gallery link copied." });
    } catch {
      setBanner({ type: "err", text: "Failed to copy gallery link." });
    }
  }

  function toggleMedia(id: string) {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.title} ${item.slug} ${item.description ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, search]);

  const filteredMedia = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    if (!q) return media;

    return media.filter((item) =>
      [
        item.title,
        item.location ?? "",
        item.event ?? "",
        item.tags.join(" "),
        item.people.join(" "),
        item.categories.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [media, mediaSearch]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Private Galleries</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create password-protected galleries with secret links and selected media.
          </p>
        </div>

        {view === "list" ? (
          <button
            type="button"
            onClick={openNew}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            New gallery
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
            banner.type === "ok"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      {view === "list" ? (
        <section className="mt-8 rounded-[2rem] border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Galleries</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search galleries..."
              className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No galleries yet.
              </div>
            ) : (
              filteredItems.map((item) => {
                const status = getGalleryStatus(item);

                return (
                  <article key={item.id} className="rounded-[2rem] border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium">{item.title}</div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          /g/{item.slug} • {item.mediaIds.length} media •{" "}
                          {item.isActive ? "Enabled" : "Disabled"}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          Expires: {item.expiresAtLocal.replace("T", " ")}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void copyLink(item.slug)}
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                        >
                          Copy link
                        </button>

                        <button
                          type="button"
                          onClick={() => void openEdit(item.id)}
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
                  </article>
                );
              })
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 space-y-6">
          <section className="rounded-[2rem] border p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingId ? "New password (optional)" : "Password"}
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry</label>
                <input
                  type="datetime-local"
                  value={expiresAtLocal}
                  onChange={(e) => setExpiresAtLocal(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium">Select media</div>
              <input
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search title, tags, location, people, event..."
                className="w-full max-w-sm rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedia.map((item) => {
                const selected = selectedMediaIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleMedia(item.id)}
                    className={`overflow-hidden rounded-[1.5rem] border text-left transition-colors ${
                      selected ? "border-foreground bg-accent/30" : "hover:bg-accent/20"
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-muted">
                      {item.secureUrl ? (
                        item.type === "video" ? (
                          <video className="h-full w-full object-cover" src={item.secureUrl} muted playsInline />
                        ) : (
                          <Image src={item.secureUrl} alt={item.title} fill className="object-cover" sizes="240px" />
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 p-3">
                      <div className="line-clamp-1 text-sm font-medium">{item.title}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {[item.location, item.event, item.tags.join(", "), item.people.join(", ")]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void save()}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              {editingId ? "Update gallery" : "Create gallery"}
            </button>

            <button
              type="button"
              onClick={backToList}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </main>
  );
}