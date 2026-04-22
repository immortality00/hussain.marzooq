"use client";

import { useEffect, useState } from "react";

function isValidUrl(u: string) {
  const s = u.trim();
  return s.startsWith("https://") && (s.includes("youtube.com") || s.includes("youtu.be") || s.includes("vimeo.com"));
}

export default function AdminShowreelPage() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/site-settings/showreel", { cache: "no-store" });
        const data = (await res.json()) as { embedUrl?: string | null };
        setValue(typeof data.embedUrl === "string" ? data.embedUrl : "");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function save() {
    setMsg("");
    const trimmed = value.trim();
    if (!isValidUrl(trimmed)) {
      setMsg("Please paste a valid YouTube/Vimeo URL (https://...)");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/site-settings/showreel/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedUrl: trimmed }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ? `Save failed: ${data.error}` : "Save failed.");
      } else {
        setMsg("✅ Saved.");
      }
    } catch {
      setMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Showreel</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a YouTube/Vimeo link. This is the single source of truth for the public Showreel and the top video on the
        public Videography page.
      </p>

      <div className="mt-8 space-y-3 rounded-2xl border p-6">
        <label className="text-sm font-medium">Showreel URL</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
        />

        <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Keep your main showreel here only. Do not depend on a separate media item tagged as <code>showreel</code> for
          the hero reel.
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}