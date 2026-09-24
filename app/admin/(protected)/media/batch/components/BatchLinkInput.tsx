"use client";

import { useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { parseVideoLink, videoEmbedSrc } from "@/lib/video-embed";
import type { ResolvedVideoLink } from "../lib/useBatchMediaState";

type Problem = { line: string; error: string };
type Lookup = { ok: true; link: ResolvedVideoLink } | ({ ok: false } & Problem);

async function lookUp(line: string): Promise<Lookup> {
  try {
    const res = await fetch("/api/media/video-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: line }),
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      embedUrl?: string;
      watchUrl?: string;
      title?: string | null;
      preview?: string | null;
    } | null;

    if (!res.ok || !data?.ok || !data.embedUrl || !data.watchUrl) {
      return { ok: false, line, error: data?.error ?? "Could not read this link." };
    }

    return {
      ok: true,
      link: {
        embedUrl: data.embedUrl,
        watchUrl: data.watchUrl,
        title: data.title ?? null,
        preview: data.preview ?? null,
      },
    };
  } catch {
    return { ok: false, line, error: "Network error." };
  }
}

export function BatchLinkInput({
  knownEmbedUrls,
  onAdd,
}: {
  knownEmbedUrls: string[];
  onAdd: (links: ResolvedVideoLink[]) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);

  async function add() {
    const lines = Array.from(new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)));
    const known = new Set(knownEmbedUrls);
    const rejected: Problem[] = [];
    const pending: string[] = [];

    for (const line of lines) {
      const video = parseVideoLink(line);
      if (!video) {
        rejected.push({ line, error: "Not a YouTube or Vimeo video link." });
        continue;
      }
      const src = videoEmbedSrc(video);
      if (known.has(src)) continue;
      known.add(src);
      pending.push(line);
    }

    setBusy(true);
    const results = await Promise.all(pending.map(lookUp));
    setBusy(false);

    const failed = [...rejected, ...results.flatMap((r) => (r.ok ? [] : [{ line: r.line, error: r.error }]))];
    onAdd(results.flatMap((r) => (r.ok ? [r.link] : [])));
    setProblems(failed);
    setText(failed.map((problem) => problem.line).join("\n"));
  }

  return (
    <div className="space-y-2">
      <label htmlFor="batch-video-links" className="text-sm font-medium">
        Video links
      </label>
      <textarea
        id="batch-video-links"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={"https://www.youtube.com/watch?v=…\nhttps://vimeo.com/…"}
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="button"
        disabled={busy || !text.trim()}
        onClick={() => void add()}
        className={adminButtonClasses("default", "md")}
      >
        {busy ? "Adding…" : "Add links"}
      </button>

      {problems.length ? (
        <ul className="space-y-1 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {problems.map((problem) => (
            <li key={problem.line} className="break-all">
              {problem.line} — {problem.error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
