"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

type MediaType = "image" | "video" | "embed";
type MediaCategory = "photography" | "videography" | "showreel" | "nft" | "art";

type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  isPublic: boolean;
  appearances: Appearance[];
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

type Uploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

type WidgetResult = { info?: unknown };

const MEDIA_CATEGORIES: Array<{ key: MediaCategory; label: string; hint: string }> = [
  { key: "photography", label: "Photography", hint: "Shows on /photography" },
  { key: "videography", label: "Videography", hint: "Shows on /videography (videos section)" },
  { key: "showreel", label: "Showreel", hint: "Top reel on /videography" },
  { key: "nft", label: "NFT", hint: "Shows on NFT page" },
  { key: "art", label: "Art", hint: "Shows on Art page" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function getString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}

function toList(tagsText: string): string[] {
  return tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 60);
}

export default function AdminMediaPage() {
  // editor state
  const [editingId, setEditingId] = useState<string>("");

  const [mode, setMode] = useState<"upload" | "embed">("upload");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<MediaCategory[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [event, setEvent] = useState("");
  const [year, setYear] = useState<string>("");
  const [tagsText, setTagsText] = useState("");
  const [appearances, setAppearances] = useState<Appearance[]>([]);

  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // list state
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const tags = useMemo(() => toList(tagsText), [tagsText]);

  function resetForm() {
    setEditingId("");
    setMode("upload");
    setUploaded(null);
    setEmbedUrl("");
    setIsPublic(true);
    setSelectedCategories([]);
    setTitle("");
    setDescription("");
    setLocation("");
    setEvent("");
    setYear("");
    setTagsText("");
    setAppearances([]);
  }

  function toggleCategory(key: MediaCategory) {
    setSelectedCategories((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  function addAppearance(kind: "featured" | "exhibited") {
    setAppearances((prev) => [
      ...prev,
      { kind, title: "", venue: "", city: "", country: "", dateFrom: "", dateTo: "", notes: "", link: "" },
    ]);
  }
  function updateAppearance(idx: number, patch: Partial<Appearance>) {
    setAppearances((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }
  function removeAppearance(idx: number) {
    setAppearances((prev) => prev.filter((_, i) => i !== idx));
  }

  function validateEmbed(url: string) {
    const u = url.trim();
    if (!u) return false;
    return u.startsWith("https://") && (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com"));
  }

  async function loadList() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/media/admin-list?limit=80", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: MediaItem[]; error?: string };
      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load media list." });
        setLoadingList(false);
        return;
      }
      setItems(data.items);
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Failed to load media list: ${getErrorMessage(e)}` });
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    void loadList();
  }, []);

  function startEdit(m: MediaItem) {
    setBanner(null);
    setEditingId(m.id);

    if (m.type === "embed") {
      setMode("embed");
      setEmbedUrl(m.embedUrl ?? "");
      setUploaded(null);
    } else {
      setMode("upload");
      setEmbedUrl("");
      if (m.secureUrl && m.publicId && m.resourceType) {
        setUploaded({ secureUrl: m.secureUrl, publicId: m.publicId, resourceType: m.resourceType });
      } else {
        setUploaded(null);
      }
    }

    setIsPublic(m.isPublic);
    setSelectedCategories((m.categories ?? []) as MediaCategory[]);
    setTitle(m.title ?? "");
    setDescription(m.description ?? "");
    setLocation(m.location ?? "");
    setEvent(m.event ?? "");
    setYear(m.year ? String(m.year) : "");
    setTagsText((m.tags ?? []).join(", "));
    setAppearances(Array.isArray(m.appearances) ? m.appearances : []);
  }

  async function save(createNewAfter: boolean) {
    setBanner(null);

    if (!title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    const parsedYear = year.trim() ? Number(year.trim()) : null;
    const yearValue = parsedYear !== null && Number.isFinite(parsedYear) ? parsedYear : null;

    const basePayload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event: event.trim() || null,
      year: yearValue,
      tags,
      categories: selectedCategories,
      people: [],
      order: 0,
      isPublic,
      appearances,
    };

    let payload: Record<string, unknown>;
    if (mode === "embed") {
      if (!validateEmbed(embedUrl)) {
        setBanner({ type: "err", text: "Please paste a valid YouTube/Vimeo URL (https://...)." });
        return;
      }
      payload = { ...basePayload, type: "embed", embedUrl: embedUrl.trim() };
    } else {
      if (!uploaded) {
        setBanner({ type: "err", text: "Upload a file first (or switch to Embed mode)." });
        return;
      }
      payload = {
        ...basePayload,
        type: uploaded.resourceType === "video" ? "video" : "image",
        secureUrl: uploaded.secureUrl,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
      };
    }

    setBusy(true);
    try {
      if (!editingId) {
        const res = await fetch("/api/media/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string };
        if (!res.ok || !data?.ok || !data.id) {
          setBanner({ type: "err", text: data?.error ? `Save failed: ${data.error}` : "Save failed." });
          setBusy(false);
          return;
        }
        setBanner({ type: "ok", text: "✅ Saved." });
      } else {
        const res = await fetch(`/api/media/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
        if (!res.ok || !data?.ok) {
          setBanner({ type: "err", text: data?.error ? `Update failed: ${data.error}` : "Update failed." });
          setBusy(false);
          return;
        }
        setBanner({ type: "ok", text: "✅ Updated." });
      }

      await loadList();
      if (createNewAfter) resetForm();
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Save error: ${getErrorMessage(e)}` });
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        setBusy(false);
        return;
      }
      setBanner({ type: "ok", text: "✅ Deleted." });
      if (editingId === id) resetForm();
      await loadList();
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Delete error: ${getErrorMessage(e)}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, delete media. Save only happens when you click Save.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Close
          </Link>
          <Link
            href="/admin/media/list"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            View list
          </Link>
        </div>
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Editor */}
        <section className="rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">
              {editingId ? "Editing existing media" : "Create new media"}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
              >
                New
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                mode === "upload" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("embed")}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                mode === "embed" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Embed
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* Upload/embed input */}
            {mode === "embed" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube/Vimeo URL</label>
                <input
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload to Cloudinary</label>
                <div className="flex flex-wrap items-center gap-2">
                  <CldUploadWidget
                    signatureEndpoint="/api/sign-cloudinary-params"
                    options={{ folder: "hm_visuals/media", multiple: false, resourceType: "auto" }}
                    onSuccess={(result: unknown) => {
                      const r = result as WidgetResult;
                      const info = r?.info;
                      if (!isRecord(info)) return;

                      const secureUrl = getString((info as Record<string, unknown>).secure_url);
                      const publicId = getString((info as Record<string, unknown>).public_id);
                      const resourceType = getString((info as Record<string, unknown>).resource_type);

                      if (secureUrl && publicId && resourceType) {
                        setUploaded({ secureUrl, publicId, resourceType });
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                      >
                        Upload
                      </button>
                    )}
                  </CldUploadWidget>

                  <button
                    type="button"
                    onClick={() => setUploaded(null)}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                  >
                    Clear
                  </button>
                </div>

                {uploaded?.secureUrl ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border bg-muted">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={uploaded.secureUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 800px"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}

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
                <label className="text-sm font-medium">Year</label>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="2026"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event</label>
                <input
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="portrait, fashion, studio"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Categories</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEDIA_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleCategory(c.key)}
                    className={`rounded-2xl border p-3 text-left text-sm hover:bg-accent/20 ${
                      selectedCategories.includes(c.key) ? "bg-accent/30" : ""
                    }`}
                  >
                    <div className="font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public
            </label>

            {/* Appearances */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">Featured / Exhibitions</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addAppearance("featured")}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                  >
                    + Featured
                  </button>
                  <button
                    type="button"
                    onClick={() => addAppearance("exhibited")}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                  >
                    + Exhibited
                  </button>
                </div>
              </div>

              {appearances.length === 0 ? (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                  No entries yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {appearances.map((a, idx) => (
                    <div key={idx} className="rounded-2xl border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{a.kind.toUpperCase()}</div>
                        <button
                          type="button"
                          onClick={() => removeAppearance(idx)}
                          className="rounded-xl border px-3 py-1.5 text-sm hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={a.title}
                          onChange={(e) => updateAppearance(idx, { title: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Title"
                        />
                        <input
                          value={a.venue}
                          onChange={(e) => updateAppearance(idx, { venue: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Venue"
                        />
                        <input
                          value={a.city}
                          onChange={(e) => updateAppearance(idx, { city: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="City"
                        />
                        <input
                          value={a.country}
                          onChange={(e) => updateAppearance(idx, { country: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Country"
                        />
                        <input
                          value={a.dateFrom}
                          onChange={(e) => updateAppearance(idx, { dateFrom: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Date from"
                        />
                        <input
                          value={a.dateTo}
                          onChange={(e) => updateAppearance(idx, { dateTo: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Date to"
                        />
                        <input
                          value={a.link}
                          onChange={(e) => updateAppearance(idx, { link: e.target.value })}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
                          placeholder="Link (optional)"
                        />
                        <textarea
                          value={a.notes}
                          onChange={(e) => updateAppearance(idx, { notes: e.target.value })}
                          className="h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
                          placeholder="Notes"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void save(false)}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
              >
                {editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void save(true)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
              >
                Save & New
              </button>
            </div>
          </div>
        </section>

        {/* Recent list */}
        <aside className="rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Recent media</div>
            <button
              type="button"
              disabled={loadingList}
              onClick={() => void loadList()}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No media yet.
              </div>
            ) : (
              items.slice(0, 20).map((m) => (
                <div key={m.id} className="rounded-2xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{m.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.type} • {m.isPublic ? "Public" : "Private"}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="rounded-xl border px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void del(m.id)}
                        className="rounded-xl border px-3 py-1.5 text-xs hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {m.secureUrl ? (
                    <div className="mt-3 overflow-hidden rounded-xl border bg-muted">
                      <div className="relative aspect-[16/9]">
                        <Image src={m.secureUrl} alt={m.title} fill className="object-cover" sizes="420px" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}