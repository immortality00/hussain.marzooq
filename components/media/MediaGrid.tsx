"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

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
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  appearances: Appearance[];
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-background/50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function formatPlace(a: Appearance) {
  return [a.venue, a.city, a.country].filter(Boolean).join(" • ");
}
function formatDates(a: Appearance) {
  return [a.dateFrom, a.dateTo].filter(Boolean).join(" → ");
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [active, setActive] = useState<MediaItem | null>(null);

  // Hide sticky CTA while modal open
  useEffect(() => {
    if (active) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [active]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const t of it.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((m) => {
      const text =
        `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${m.event ?? ""} ${(m.tags ?? []).join(" ")} ${(m.people ?? []).join(" ")}`.toLowerCase();
      const matchesQuery = query ? text.includes(query) : true;
      const matchesTag = activeTag ? m.tags.includes(activeTag) : true;
      return matchesQuery && matchesTag;
    });
  }, [items, q, activeTag]);

  const exhibitions = useMemo(() => (active?.appearances ?? []).filter((a) => a.kind === "exhibited"), [active]);
  const features = useMemo(() => (active?.appearances ?? []).filter((a) => a.kind === "featured"), [active]);

  return (
    <div className="mt-10 space-y-6">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location, event, people, tag…"
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

      {/* Tags */}
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

      {/* Grid */}
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
            className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b bg-background/80 p-4 backdrop-blur">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{active.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {[active.year ? String(active.year) : "", active.location ?? "", active.event ?? ""]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent" onClick={() => setActive(null)}>
                Close
              </button>
            </div>

            {/* IMPORTANT: fixed height + min-h-0 so overflow works */}
            <div className="grid h-[82vh] min-h-0 lg:grid-cols-[1.25fr_0.75fr]">
              {/* Media area */}
              <div className="min-h-0 bg-black/5 p-4">
                {active.secureUrl ? (
                  <div className="h-full w-full overflow-hidden rounded-2xl border bg-black/5">
                    <div className="relative h-full min-h-0">
                      {/* Fit inside available height */}
                      <div className="relative h-full w-full">
                        <Image
                          src={active.secureUrl}
                          alt={active.title}
                          fill
                          className="object-contain"
                          sizes="100vw"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No media</div>
                )}
              </div>

              {/* Details (scroll) */}
              <div className="min-h-0 overflow-y-auto p-5">
                <div className="space-y-4">
                  {active.description ? (
                    <Section title="Description">
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{active.description}</div>
                    </Section>
                  ) : null}

                  <Section title="Details">
                    <div className="flex flex-wrap gap-2">
                      {active.year ? <Pill>{String(active.year)}</Pill> : null}
                      {active.location ? <Pill>{active.location}</Pill> : null}
                      {active.event ? <Pill>{active.event}</Pill> : null}
                    </div>
                  </Section>

                  {active.people?.length ? (
                    <Section title="People">
                      <div className="flex flex-wrap gap-2">
                        {active.people.slice(0, 80).map((p) => (
                          <Pill key={p}>{p}</Pill>
                        ))}
                      </div>
                    </Section>
                  ) : null}

                  {active.categories?.length ? (
                    <Section title="Categories">
                      <div className="flex flex-wrap gap-2">
                        {active.categories.slice(0, 80).map((c) => (
                          <Pill key={c}>{c}</Pill>
                        ))}
                      </div>
                    </Section>
                  ) : null}

                  {active.tags?.length ? (
                    <Section title="Tags">
                      <div className="flex flex-wrap gap-2">
                        {active.tags.slice(0, 120).map((t) => (
                          <Pill key={t}>{t}</Pill>
                        ))}
                      </div>
                    </Section>
                  ) : null}

                  {(exhibitions.length || features.length) ? (
                    <Section title="Exhibitions / Featured">
                      <div className="space-y-4">
                        {/* Exhibitions first */}
                        {exhibitions.length ? (
                          <div className="space-y-2">
                            <div className="text-sm font-semibold">Exhibitions</div>
                            {exhibitions.map((a, idx) => (
                              <div key={`ex-${idx}`} className="rounded-2xl border bg-background p-3">
                                <div className="text-sm font-medium">{a.title || a.venue || "Exhibition"}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{formatPlace(a)}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{formatDates(a)}</div>
                                {a.notes ? (
                                  <div className="mt-2 text-xs whitespace-pre-wrap leading-relaxed">{a.notes}</div>
                                ) : null}
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
                        ) : null}

                        {/* Featured second */}
                        {features.length ? (
                          <div className="space-y-2">
                            <div className="text-sm font-semibold">Featured</div>
                            {features.map((a, idx) => (
                              <div key={`fe-${idx}`} className="rounded-2xl border bg-background p-3">
                                <div className="text-sm font-medium">{a.title || a.venue || "Featured"}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{formatPlace(a)}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{formatDates(a)}</div>
                                {a.notes ? (
                                  <div className="mt-2 text-xs whitespace-pre-wrap leading-relaxed">{a.notes}</div>
                                ) : null}
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
                        ) : null}
                      </div>
                    </Section>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}