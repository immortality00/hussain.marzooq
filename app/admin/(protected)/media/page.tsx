"use client";

import { useMemo, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

type Uploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
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

const MEDIA_CATEGORIES: Array<{ key: MediaCategory; label: string; hint: string }> = [
  { key: "photography", label: "Photography", hint: "Shows on /photography" },
  { key: "videography", label: "Videography", hint: "Shows on /videography/videos" },
  { key: "showreel", label: "Showreel", hint: "Used on videography showreel" },
  { key: "nft", label: "NFT", hint: "Shows on NFT page" },
  { key: "art", label: "Art", hint: "Shows on Art page" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function getString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function getNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

export default function AdminMediaPage() {
  const [mode, setMode] = useState<"upload" | "embed">("upload");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<MediaCategory[]>([]);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [event, setEvent] = useState("");
  const [year, setYear] = useState<string>("");
  const [tagsText, setTagsText] = useState("");

  const [appearances, setAppearances] = useState<Appearance[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string>("");
  const [savedId, setSavedId] = useState<string>("");

  const tags = useMemo(() => {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsText]);

  function toggleCategory(key: MediaCategory) {
    setSelectedCategories((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  function addAppearance(kind: "featured" | "exhibited") {
    setAppearances((prev) => [
      ...prev,
      {
        kind,
        title: "",
        venue: "",
        city: "",
        country: "",
        dateFrom: "",
        dateTo: "",
        notes: "",
        link: "",
      },
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

  async function saveToDb() {
    setSaveMsg("");
    setSavedId("");

    if (!title.trim()) {
      setSaveMsg("Title is required.");
      return;
    }

    const parsedYear = year.trim() ? Number(year.trim()) : null;
    const yearValue = parsedYear && Number.isFinite(parsedYear) ? parsedYear : null;

    const basePayload: Record<string, unknown> = {
      title: title.trim(),
      description: null,
      location: location.trim() || null,
      event: event.trim() || null,
      year: yearValue,
      tags,
      categories: selectedCategories,
      people: [],
      projectId: null,
      order: 0,
      isPublic,
      appearances,
    };

    let payload: Record<string, unknown>;

    if (mode === "embed") {
      if (!validateEmbed(embedUrl)) {
        setSaveMsg("Please paste a valid YouTube/Vimeo URL (https://...).");
        return;
      }
      payload = { ...basePayload, type: "embed", embedUrl: embedUrl.trim() };
    } else {
      if (!uploaded) {
        setSaveMsg("Upload a file first (or switch to Embed mode).");
        return;
      }

      payload = {
        ...basePayload,
        type: uploaded.resourceType === "video" ? "video" : "image",
        secureUrl: uploaded.secureUrl,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        bytes: uploaded.bytes ?? null,
        format: uploaded.format ?? null,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        duration: uploaded.duration ?? null,
      };
    }

    setSaving(true);

    try {
      const res = await fetch("/api/media/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };

      if (!res.ok || !data.ok || !data.id) {
        setSaveMsg(data.error ? `Save failed: ${data.error}` : "Save failed.");
        setSaving(false);
        return;
      }

      setSavedId(data.id);
      setSaveMsg("✅ Saved to database.");
      setSaving(false);
    } catch (e: unknown) {
      setSaveMsg(`Save error: ${getErrorMessage(e)}`);
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload images/videos to Cloudinary OR save a YouTube/Vimeo embed. Add multiple featured/exhibited entries.
      </p>

      <div className="mt-8 rounded-2xl border p-6 space-y-8">
        {/* Source */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">1) Source</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${mode === "upload" ? "bg-accent" : "hover:bg-accent/40"}`}
            >
              Upload (Cloudinary)
            </button>
            <button
              type="button"
              onClick={() => setMode("embed")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${mode === "embed" ? "bg-accent" : "hover:bg-accent/40"}`}
            >
              Embed (YouTube/Vimeo)
            </button>
          </div>

          {mode === "embed" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Embed URL</label>
              <input
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              />
            </div>
          ) : (
            <>
              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary-params"
                options={{ folder: "hm_visuals", multiple: false, resourceType: "auto" }}
                onSuccess={(result: unknown) => {
                  const r = result as WidgetResult;
                  const info = r?.info;
                  if (!isRecord(info)) return;

                  const secureUrl = getString((info as Record<string, unknown>).secure_url) ?? "";
                  const publicId = getString((info as Record<string, unknown>).public_id) ?? "";
                  const resourceType = getString((info as Record<string, unknown>).resource_type) ?? "auto";
                  if (!secureUrl || !publicId) return;

                  setUploaded({
                    secureUrl,
                    publicId,
                    resourceType,
                    bytes: getNumber((info as Record<string, unknown>).bytes),
                    format: getString((info as Record<string, unknown>).format),
                    width: getNumber((info as Record<string, unknown>).width),
                    height: getNumber((info as Record<string, unknown>).height),
                    duration: getNumber((info as Record<string, unknown>).duration),
                  });

                  if (!title.trim()) {
                    const original = getString((info as Record<string, unknown>).original_filename);
                    if (original) setTitle(original);
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                  >
                    Upload (Cloudinary)
                  </button>
                )}
              </CldUploadWidget>

              {uploaded ? (
                <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
                  Uploaded:{" "}
                  <a className="underline" href={uploaded.secureUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No upload yet.</div>
              )}
            </>
          )}
        </div>

        {/* Visibility + categories */}
        <div className="space-y-3">
          <div className="text-sm font-medium">2) Visibility + Categories</div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Public (visible on website)
          </label>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {MEDIA_CATEGORIES.map((c) => {
              const checked = selectedCategories.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCategory(c.key)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${checked ? "bg-accent" : "hover:bg-accent/40"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{checked ? "Selected" : ""}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="text-sm font-medium">3) Details</div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
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
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="2026"
                inputMode="numeric"
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Appearances */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">4) Featured / Exhibited (multiple)</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addAppearance("featured")}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
              >
                + Featured
              </button>
              <button
                type="button"
                onClick={() => addAppearance("exhibited")}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
              >
                + Exhibited
              </button>
            </div>
          </div>

          {appearances.length === 0 ? (
            <div className="text-sm text-muted-foreground">No entries yet.</div>
          ) : (
            <div className="space-y-4">
              {appearances.map((a, idx) => (
                <div key={idx} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">
                      {a.kind === "featured" ? "Featured" : "Exhibited"} #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAppearance(idx)}
                      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-red-500/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={a.title}
                      onChange={(e) => updateAppearance(idx, { title: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Title (e.g. NFT NYC 2025)"
                    />
                    <input
                      value={a.venue}
                      onChange={(e) => updateAppearance(idx, { venue: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Venue"
                    />
                    <input
                      value={a.city}
                      onChange={(e) => updateAppearance(idx, { city: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="City"
                    />
                    <input
                      value={a.country}
                      onChange={(e) => updateAppearance(idx, { country: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Country"
                    />
                    <input
                      value={a.dateFrom}
                      onChange={(e) => updateAppearance(idx, { dateFrom: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Date from (YYYY-MM-DD)"
                    />
                    <input
                      value={a.dateTo}
                      onChange={(e) => updateAppearance(idx, { dateTo: e.target.value })}
                      className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Date to (YYYY-MM-DD)"
                    />
                    <input
                      value={a.link}
                      onChange={(e) => updateAppearance(idx, { link: e.target.value })}
                      className="md:col-span-2 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Link (optional)"
                    />
                    <textarea
                      value={a.notes}
                      onChange={(e) => updateAppearance(idx, { notes: e.target.value })}
                      className="md:col-span-2 h-20 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Notes (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="pt-2 border-t flex items-center gap-3">
          <button
            type="button"
            onClick={() => void saveToDb()}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save to Database"}
          </button>
          {saveMsg ? <div className="text-sm text-muted-foreground">{saveMsg}</div> : null}
          {savedId ? (
            <div className="text-xs text-muted-foreground">
              Saved ID: <span className="font-mono">{savedId}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}