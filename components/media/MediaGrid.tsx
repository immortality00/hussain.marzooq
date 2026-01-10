"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MediaItem = {
  id: string;
  title: string;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  secureUrl: string | null;
};

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");

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
      {/* Search */}
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

      {/* Tag chips */}
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
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
          No matches. Try a different search or tag.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, idx) => {
            const src = m.secureUrl ?? "";
            if (!src) return null;

            // Prioritize only the first few images to help LCP without loading everything eagerly
            const priority = idx < 3;

            return (
              <a
                key={m.id}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border bg-muted"
                title={m.title}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={src}
                    alt={m.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 w-full p-4">
                      <div className="text-sm font-medium text-white">{m.title}</div>
                      <div className="mt-1 text-xs text-white/80">
                        {m.year ? `${m.year}` : ""}
                        {m.location ? ` • ${m.location}` : ""}
                        {m.event ? ` • ${m.event}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}