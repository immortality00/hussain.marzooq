"use client";

import { useEffect, useMemo, useState } from "react";
import { PrivateGalleryMediaPicker } from "@/components/admin/private-galleries/PrivateGalleryMediaPicker";
import type { GalleryItem } from "@/components/admin/private-galleries/types";

const MIN_PRIVATE_GALLERY_PASSWORD_LENGTH = 8;

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
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  async function loadGalleries() {
    setLoading(true);
    setBanner(null);

    try {
      const res = await fetch("/api/private-galleries", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: GalleryItem[];
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load galleries." });
        return;
      }

      setItems(data.items);
    } catch {
      setBanner({ type: "err", text: "Failed to load private galleries." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGalleries();
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
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        item?: GalleryItem;
        error?: string;
      } | null;

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

    if (!editingId && password.trim().length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
      setBanner({
        type: "err",
        text: `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    if (editingId && password.trim() && password.trim().length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
      setBanner({
        type: "err",
        text: `New password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`,
      });
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
        editingId
          ? `/api/private-galleries/${encodeURIComponent(editingId)}`
          : "/api/private-galleries",
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

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Save failed." });
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Gallery updated." : "✅ Gallery created." });
      await loadGalleries();
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
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
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
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            New gallery
          </button>
        ) : (
          <button
            type="button"
            onClick={backToList}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
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
              onChange={(event) => setSearch(event.target.value)}
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
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingId ? "New password (optional)" : "Password"}
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry</label>
                <input
                  type="datetime-local"
                  value={expiresAtLocal}
                  onChange={(event) => setExpiresAtLocal(event.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active
              </label>
            </div>
          </section>

          <PrivateGalleryMediaPicker
            selectedMediaIds={selectedMediaIds}
            onToggleMedia={toggleMedia}
          />

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