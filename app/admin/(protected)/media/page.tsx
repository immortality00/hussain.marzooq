"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MediaAppearancesSection from "./components/MediaAppearancesSection";
import MediaAssetSection from "./components/MediaAssetSection";
import MediaDetailsSection from "./components/MediaDetailsSection";
import MediaPlacementSection from "./components/MediaPlacementSection";
import type { Appearance, MediaCategory, MediaItem, Uploaded } from "./lib/types";
import { toList, validateEmbed } from "./lib/utils";

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
          <h1 className="text-2xl font-semibold tracking-tight">
            {editingId ? "Edit Media" : "Upload Media"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Form only. Manage items list separately.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/media/list"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            View list
          </Link>

          {editingId ? (
            <button
              type="button"
              onClick={() => {
                resetFields(false);
                router.push("/admin/media");
              }}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              New upload
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

      <div className="mt-8 space-y-6">
        <MediaAssetSection
          mode={mode}
          setMode={setMode}
          uploaded={uploaded}
          setUploaded={setUploaded}
          embedUrl={embedUrl}
          setEmbedUrl={setEmbedUrl}
        />

        <MediaDetailsSection
          title={title}
          setTitle={setTitle}
          year={year}
          setYear={setYear}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          event={event}
          setEvent={setEvent}
          tagsText={tagsText}
          setTagsText={setTagsText}
          peopleText={peopleText}
          setPeopleText={setPeopleText}
        />

        <MediaPlacementSection
          categories={categories}
          toggleCategory={toggleCategory}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
        />

        <MediaAppearancesSection
          appearances={appearances}
          addAppearance={addAppearance}
          updateAppearance={updateAppearance}
          removeAppearance={removeAppearance}
        />

        <section className="rounded-3xl border p-5">
          <div className="flex flex-wrap gap-2">
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
      </div>
    </main>
  );
}