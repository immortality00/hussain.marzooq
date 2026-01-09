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
function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [event, setEvent] = useState("");
  const [year, setYear] = useState<string>("");
  const [tagsText, setTagsText] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string>("");
  const [savedId, setSavedId] = useState<string>("");

  const tags = useMemo(() => {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsText]);

  function clearAll() {
    setUploaded(null);
    setTitle("");
    setLocation("");
    setEvent("");
    setYear("");
    setTagsText("");
    setSaving(false);
    setSaveMsg("");
    setSavedId("");
  }

  async function saveToDb() {
    if (!uploaded) {
      setSaveMsg("Upload a file first.");
      return;
    }
    if (!title.trim()) {
      setSaveMsg("Title is required.");
      return;
    }

    setSaving(true);
    setSaveMsg("");
    setSavedId("");

    const parsedYear = year.trim() ? Number(year.trim()) : null;
    const yearValue = parsedYear && Number.isFinite(parsedYear) ? parsedYear : null;

    const payload = {
      type: uploaded.resourceType === "video" ? "video" : "image",
      title: title.trim(),
      description: null,
      location: location.trim() || null,
      event: event.trim() || null,
      year: yearValue,

      tags,
      categories: [],
      people: [],
      projectId: null,

      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      bytes: uploaded.bytes ?? null,
      format: uploaded.format ?? null,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      duration: uploaded.duration ?? null,

      order: 0,
    };

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
        Upload to Cloudinary, then save metadata to MongoDB. (Big files over 100MB are limited by plan.)
      </p>

      <div className="mt-8 rounded-2xl border p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">1) Upload</div>
          <button
            type="button"
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            onClick={clearAll}
          >
            Clear
          </button>
        </div>

        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{ folder: "hm_visuals", multiple: false, resourceType: "auto" }}
          onSuccess={(result: unknown) => {
            const r = result as WidgetResult;
            const info = r?.info;

            if (!isRecord(info)) return;

            const secureUrl = getString(info.secure_url) ?? "";
            const publicId = getString(info.public_id) ?? "";
            const resourceType = getString(info.resource_type) ?? "auto";

            if (!secureUrl || !publicId) return;

            setUploaded({
              secureUrl,
              publicId,
              resourceType,
              bytes: getNumber(info.bytes),
              format: getString(info.format),
              width: getNumber(info.width),
              height: getNumber(info.height),
              duration: getNumber(info.duration),
            });

            if (!title.trim()) {
              const original = getString(info.original_filename);
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
          <div className="rounded-2xl border p-5 space-y-2">
            <div className="text-sm">
              <span className="font-medium">URL:</span>{" "}
              <a className="underline" href={uploaded.secureUrl} target="_blank" rel="noreferrer">
                Open uploaded file
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">public_id:</span> {uploaded.publicId}
            </div>
            {uploaded.bytes ? (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Size:</span> {formatBytes(uploaded.bytes)}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upload yet.</p>
        )}

        <div className="pt-2 border-t" />

        <div className="text-sm font-medium">2) Details</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Desert Portrait — Dubai"
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
              placeholder="Dubai / Abu Dhabi / NYC…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event</label>
            <input
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Wedding / Festival / Fashion Show…"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="portrait, fashion, dubai, cinematic"
          />
          <p className="text-xs text-muted-foreground">
            We’ll upgrade tags + categories + people later with proper UI and face tagging.
          </p>
        </div>

        <div className="pt-2 border-t" />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void saveToDb()}
            disabled={saving}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save to Database"}
          </button>

          {saveMsg ? <p className="text-sm text-muted-foreground">{saveMsg}</p> : null}
        </div>

        {savedId ? (
          <p className="text-xs text-muted-foreground">
            Saved ID: <span className="font-mono">{savedId}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
