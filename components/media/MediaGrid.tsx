"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
  type: string;
  title: string;
  description?: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories?: string[];
  appearances?: Appearance[];
  secureUrl: string | null;
  embedUrl?: string | null;
};

function toEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  }

  if (host === "player.vimeo.com") return input;
  if (host === "youtube-nocookie.com") return input;
  if (host === "youtube.com" && u.pathname.includes("/embed/")) return input;

  return null;
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [active, setActive] = useState<MediaItem | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const t of it.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((m) => {
      const text = `${m.title} ${m.location ?? ""} ${m.event ?? ""} ${(m.tags ?? []).join(" ")}`.toLowerCase();
      const matchesQuery = query ? text.includes(query) : true;
      const matchesTag = activeTag ? m.tags.includes(activeTag) : true;
      return matchesQuery && matchesTag;
    });
  }, [items, q, activeTag]);

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location, event, tag…"
          className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md"
        />

        <button
          type="button"
          onClick={() => {
            setQ("");
            setActiveTag("");
          }}
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Clear
        </button>
      </div>

      {allTags.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag("")}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeTag === "" ? "bg-accent" : "hover:bg-accent/40"
            }`}
          >
            All
          </button>

          {allTags.slice(0, 30).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(t === activeTag ? "" : t)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                t === activeTag ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
          No matches. Try a different search or tag.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, idx) => {
            const src = m.secureUrl ?? "";
            const priority = idx < 3;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(m)}
                className="group overflow-hidden rounded-2xl border bg-muted text-left"
                title={m.title}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={src || "/placeholder.png"}
                    alt={m.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-sm font-medium line-clamp-1">{m.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {m.year ? `${m.year}` : ""}
                    {m.location ? ` • ${m.location}` : ""}
                    {m.event ? ` • ${m.event}` : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActive(null)}>
          <div
            className="w-full max-w-5xl overflow-hidden rounded-3xl border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{active.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {active.year ? `${active.year}` : ""}
                  {active.location ? ` • ${active.location}` : ""}
                  {active.event ? ` • ${active.event}` : ""}
                </div>
              </div>
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent" onClick={() => setActive(null)}>
                Close
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-muted">
                {active.type === "embed" && active.embedUrl ? (
                  <div className="relative aspect-video">
                    <iframe
                      src={toEmbedUrl(active.embedUrl) ?? active.embedUrl}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={active.title}
                    />
                  </div>
                ) : active.type === "video" && active.secureUrl ? (
                  <video className="h-full w-full" controls preload="metadata" src={active.secureUrl} />
                ) : active.secureUrl ? (
                  <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
                    <Image src={active.secureUrl} alt={active.title} fill className="object-contain" sizes="100vw" />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No media</div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {active.description ? (
                  <div className="text-sm">
                    <div className="text-xs font-medium text-muted-foreground">Description</div>
                    <div className="mt-1 whitespace-pre-wrap">{active.description}</div>
                  </div>
                ) : null}

                {active.categories?.length ? (
                  <div className="text-sm">
                    <div className="text-xs font-medium text-muted-foreground">Categories</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {active.categories.slice(0, 12).map((c) => (
                        <span key={c} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {active.tags?.length ? (
                  <div className="text-sm">
                    <div className="text-xs font-medium text-muted-foreground">Tags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {active.tags.slice(0, 20).map((t) => (
                        <span key={t} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {active.appearances?.length ? (
                  <div className="text-sm">
                    <div className="text-xs font-medium text-muted-foreground">Featured / Exhibitions</div>
                    <div className="mt-2 space-y-2">
                      {active.appearances.slice(0, 20).map((a, idx) => (
                        <div key={idx} className="rounded-2xl border p-3">
                          <div className="text-xs font-semibold">{a.kind.toUpperCase()}</div>
                          <div className="mt-1 text-sm font-medium">{a.title || a.venue}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {[a.venue, a.city, a.country].filter(Boolean).join(" • ")}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {[a.dateFrom, a.dateTo].filter(Boolean).join(" → ")}
                          </div>
                          {a.notes ? <div className="mt-2 text-xs whitespace-pre-wrap">{a.notes}</div> : null}
                          {a.link ? (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex text-xs underline underline-offset-2"
                            >
                              Link
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}