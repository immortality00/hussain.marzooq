"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

type Uploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

type WidgetResult = { info?: unknown };

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

type MediaType = "image" | "video" | "embed";

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
  appearances: Appearance[];
  isPublic: boolean;
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
  embedUrl: string | null;
};

const MEDIA_CATEGORIES: Array<{ key: MediaCategory; label: string; hint: string }> = [
  { key: "photography", label: "Photography", hint: "Shows on /photography" },
  { key: "videography", label: "Videography", hint: "Shows on /videography/videos" },
  { key: "showreel", label: "Showreel", hint: "Used on videography showreel" },
  { key: "nft", label: "NFT", hint: "Shows on NFT page" },
  { key: "art", label: "Art", hint: "Shows on Art page" },
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function getString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function toList(csv: string): string[] {
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 60);
}
function validateEmbed(url: string) {
  const u = url.trim();
  if (!u) return false;
  return u.startsWith("https://") && (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com"));
}

export default function AdminMediaPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const editId = (sp.get("edit") ?? "").trim();

  const [editingId, setEditingId] = useState<string>("");

  const [mode, setMode] = useState<"upload" | "embed">("upload");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [event, setEvent] = useState("");
  const [year, setYear] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [peopleText, setPeopleText] = useState("");
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [appearances, setAppearances] = useState<Appearance[]>([]);

  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const tags = useMemo(() => toList(tagsText), [tagsText]);
  const people = useMemo(() => toList(peopleText), [peopleText]);

  function resetFields(keepBanner: boolean) {
    setEditingId("");
    setMode("upload");
    setUploaded(null);
    setEmbedUrl("");
    setTitle("");
    setDescription("");
    setLocation("");
    setEvent("");
    setYear("");
    setTagsText("");
    setPeopleText("");
    setCategories([]);
    setIsPublic(true);
    setAppearances([]);
    if (!keepBanner) setBanner(null);
  }

  function toggleCategory(key: MediaCategory) {
    setCategories((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
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

  async function loadMedia(id: string) {
    const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; item?: MediaItem; error?: string };
    if (!res.ok || !data?.ok || !data.item) {
      setBanner({ type: "err", text: data?.error ?? "Failed to load media." });
      return;
    }

    const m = data.item;

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

    setTitle(m.title ?? "");
    setDescription(m.description ?? "");
    setLocation(m.location ?? "");
    setEvent(m.event ?? "");
    setYear(m.year ? String(m.year) : "");
    setTagsText((m.tags ?? []).join(", "));
    setPeopleText((m.people ?? []).join(", "));
    setCategories((m.categories ?? []) as MediaCategory[]);
    setIsPublic(Boolean(m.isPublic));
    setAppearances(Array.isArray(m.appearances) ? m.appearances : []);
  }

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;

    async function run() {
      setBanner(null);
      setBusy(true);
      try {
        if (!cancelled) await loadMedia(editId);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  async function save() {
    setBanner(null);

    if (!title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    const yearNum = year.trim() ? Number(year.trim()) : null;
    const yearValue = yearNum !== null && Number.isFinite(yearNum) ? yearNum : null;

    const payloadBase: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event: event.trim() || null,
      year: yearValue,
      tags,
      categories,
      people,
      isPublic,
      appearances,
    };

    // this includes asset fields if present
    let payloadWithAsset: Record<string, unknown> | null = null;

    if (mode === "embed") {
      if (!validateEmbed(embedUrl)) {
        setBanner({ type: "err", text: "Please paste a valid YouTube/Vimeo URL (https://...)." });
        return;
      }
      payloadWithAsset = { ...payloadBase, type: "embed", embedUrl: embedUrl.trim() };
    } else {
      if (uploaded) {
        payloadWithAsset = {
          ...payloadBase,
          type: uploaded.resourceType === "video" ? "video" : "image",
          secureUrl: uploaded.secureUrl,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        };
      } else if (!editingId) {
        setBanner({ type: "err", text: "Upload a file first (or switch to Embed mode)." });
        return;
      }
      // if editing and uploaded is null, keep existing asset (allowed)
    }

    setBusy(true);
    try {
      if (!editingId) {
        const res = await fetch("/api/media/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadWithAsset),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string };
        if (!res.ok || !data?.ok) {
          setBanner({ type: "err", text: data?.error ?? "Save failed." });
          return;
        }

        setBanner({ type: "ok", text: "✅ Media saved successfully." });
        resetFields(true);
      } else {
        // IMPORTANT: if user uploaded new asset, we must send it
        const updateBody = payloadWithAsset ?? payloadBase;

        const res = await fetch(`/api/media/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
        if (!res.ok || !data?.ok) {
          setBanner({ type: "err", text: data?.error ?? "Update failed." });
          return;
        }

        setBanner({ type: "ok", text: "✅ Updated successfully." });
        await loadMedia(editingId);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!editingId) return;
    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(editingId)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }
      setBanner({ type: "ok", text: "✅ Deleted." });
      resetFields(true);
      router.push("/admin/media/list");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{editingId ? "Edit Media" : "Upload Media"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Form only. Manage items from Media List.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/media/list"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Close
          </Link>

          {editingId ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBanner(null);
                resetFields(false);
                router.push("/admin/media");
              }}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
            >
              New
            </button>
          ) : null}
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

      <section className="mt-8 rounded-2xl border p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
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
            <label className="text-sm font-medium">
              Upload to Cloudinary{" "}
              {editingId ? <span className="text-xs text-muted-foreground">(optional: upload to replace existing)</span> : null}
            </label>
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
                <div className="relative aspect-video">
                  <Image src={uploaded.secureUrl} alt="Preview" fill className="object-cover" sizes="100vw" />
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

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">People (comma-separated)</label>
            <input
              value={peopleText}
              onChange={(e) => setPeopleText(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe, Jane Doe"
            />
          </div>
        </div>

        {/* Placement (NO labels; style-only selection) */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Placement</div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MEDIA_CATEGORIES.map((c) => {
              const selected = categories.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCategory(c.key)}
                  className={[
                    "relative overflow-hidden rounded-2xl border p-4 text-left text-sm transition-all",
                    "hover:-translate-y-[1px] hover:shadow-md",
                    selected
                      ? "border-foreground/30 shadow-lg ring-2 ring-foreground/15 bg-accent/35 scale-[1.01]"
                      : "hover:bg-accent/15",
                  ].join(" ")}
                >
                  {/* subtle glow only when selected */}
                  {selected ? (
                    <div className="pointer-events-none absolute inset-0 opacity-70">
                      <div className="absolute -inset-16 bg-radial from-foreground/10 via-transparent to-transparent" />
                    </div>
                  ) : null}

                  <div className="relative">
                    <div className="font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.hint}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Public
        </label>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">Featured / Exhibitions</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addAppearance("exhibited")}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
              >
                + Exhibition
              </button>
              <button
                type="button"
                onClick={() => addAppearance("featured")}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
              >
                + Feature
              </button>
            </div>
          </div>

          {appearances.length === 0 ? (
            <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No entries yet.</div>
          ) : (
            <div className="space-y-3">
              {appearances.map((a, idx) => (
                <div key={idx} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{a.kind === "exhibited" ? "EXHIBITION" : "FEATURED"}</div>
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
            onClick={() => void save()}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
          >
            {editingId ? "Update" : "Save"}
          </button>

          {editingId ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void del()}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10 disabled:opacity-60"
            >
              Delete
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}