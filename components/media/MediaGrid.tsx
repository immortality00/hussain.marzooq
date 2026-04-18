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
  people?: string[];
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

function Pill({ children }: { children: string }) {
  return <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{children}</span>;
}

function SectionTitle({ children }: { children: string }) {
  return <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{children}</div>;
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
      const text = `${m.title} ${m.location ?? ""} ${m.event ?? ""} ${(m.tags ?? []).join(" ")} ${(m.people ?? []).join(" ")}`.toLowerCase();
      const matchesQuery = query ? text.includes(query) : true;
      const matchesTag = activeTag ? m.tags.includes(activeTag) : true;
      return matchesQuery && matchesTag;
    });
  }, [items, q, activeTag]);

  const featured = useMemo(() => (active?.appearances ?? []).filter((a) => a.kind === "featured"), [active]);
  const exhibited = useMemo(() => (active?.appearances ?? []).filter((a) => a.kind === "exhibited"), [active]);

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location, event, tag, people…"
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
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${activeTag === "" ? "bg-accent" : "hover:bg-accent/40"}`}
          >
            All
          </button>
          {allTags.slice(0, 30).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(t === activeTag ? "" : t)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${t === activeTag ? "bg-accent" : "hover:bg-accent/40"}`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">No matches.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m)}
              className="group overflow-hidden rounded-2xl border bg-muted text-left"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={m.secureUrl ?? "/placeholder.png"}
                  alt={m.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={idx < 3}
                />
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                </div>
              </div>

              <div className="p-4">
                <div className="text-sm font-medium line-clamp-1">{m.title}</div>
                <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {[m.year ? String(m.year) : "", m.location ?? "", m.event ?? ""].filter(Boolean).join(" • ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {active ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setActive(null)}>
          <div
            className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{active.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {[active.year ? String(active.year) : "", active.location ?? "", active.event ?? ""].filter(Boolean).join(" • ")}
                </div>
              </div>
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent" onClick={() => setActive(null)}>
                Close
              </button>
            </div>

            <div className="grid max-h-[82vh] lg:grid-cols-[1.25fr_0.75fr]">
              {/* Media */}
              <div className="bg-black/5 p-4 flex items-center justify-center">
                {active.type === "embed" && active.embedUrl ? (
                  <div className="w-full overflow-hidden rounded-2xl border bg-black">
                    <div className="relative aspect-video">
                      <iframe
                        src={toEmbedUrl(active.embedUrl) ?? active.embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={active.title}
                      />
                    </div>
                  </div>
                ) : active.type === "video" && active.secureUrl ? (
                  <div className="w-full overflow-hidden rounded-2xl border bg-black">
                    <video className="h-full w-full" controls preload="metadata" src={active.secureUrl} />
                  </div>
                ) : active.secureUrl ? (
                  <div className="w-full overflow-hidden rounded-2xl border bg-black/5">
                    <div className="relative aspect-4/3 lg:aspect-auto lg:h-[78vh]">
                      <Image src={active.secureUrl} alt={active.title} fill className="object-contain" sizes="100vw" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No media</div>
                )}
              </div>

              {/* Details */}
              <div className="overflow-y-auto p-5 space-y-6">
                {active.description ? (
                  <div>
                    <SectionTitle>Description</SectionTitle>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{active.description}</div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <SectionTitle>Details</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {active.year ? <Pill>{String(active.year)}</Pill> : null}
                    {active.location ? <Pill>{active.location}</Pill> : null}
                    {active.event ? <Pill>{active.event}</Pill> : null}
                    <Pill>{active.type}</Pill>
                  </div>
                </div>

                {active.people?.length ? (
                  <div className="space-y-2">
                    <SectionTitle>People</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {active.people.slice(0, 30).map((p) => (
                        <Pill key={p}>{p}</Pill>
                      ))}
                    </div>
                  </div>
                ) : null}

                {active.categories?.length ? (
                  <div className="space-y-2">
                    <SectionTitle>Categories</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {active.categories.slice(0, 30).map((c) => (
                        <Pill key={c}>{c}</Pill>
                      ))}
                    </div>
                  </div>
                ) : null}

                {active.tags?.length ? (
                  <div className="space-y-2">
                    <SectionTitle>Tags</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {active.tags.slice(0, 40).map((t) => (
                        <Pill key={t}>{t}</Pill>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(featured.length || exhibited.length) ? (
                  <div className="space-y-3">
                    <SectionTitle>Featured / Exhibitions</SectionTitle>

                    {featured.length ? (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Featured</div>
                        {featured.map((a, idx) => (
                          <div key={`f-${idx}`} className="rounded-2xl border p-3">
                            <div className="text-sm font-medium">{a.title || a.venue}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{[a.venue, a.city, a.country].filter(Boolean).join(" • ")}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{[a.dateFrom, a.dateTo].filter(Boolean).join(" → ")}</div>
                            {a.notes ? <div className="mt-2 text-xs whitespace-pre-wrap">{a.notes}</div> : null}
                            {a.link ? (
                              <a href={a.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs underline underline-offset-2">
                                Link
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {exhibited.length ? (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Exhibited</div>
                        {exhibited.map((a, idx) => (
                          <div key={`e-${idx}`} className="rounded-2xl border p-3">
                            <div className="text-sm font-medium">{a.title || a.venue}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{[a.venue, a.city, a.country].filter(Boolean).join(" • ")}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{[a.dateFrom, a.dateTo].filter(Boolean).join(" → ")}</div>
                            {a.notes ? <div className="mt-2 text-xs whitespace-pre-wrap">{a.notes}</div> : null}
                            {a.link ? (
                              <a href={a.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs underline underline-offset-2">
                                Link
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
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