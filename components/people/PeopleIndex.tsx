"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicPersonIndexItem } from "@/lib/server/public-people";

export default function PeopleIndex({ items }: { items: PublicPersonIndexItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const text = `${item.name} ${item.headline ?? ""} ${item.bio ?? ""} ${item.aliases.join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [items, query]);

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, aliases, or headline..."
          className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md"
        />

        <div className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border p-8 text-sm text-muted-foreground">
          No people match this search.
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const image = item.coverUrl || item.avatarUrl || item.featuredImage;

            return (
              <article key={item.id} className="overflow-hidden rounded-[2rem] border bg-background/60">
                <Link href={`/people/${item.slug}`} className="block">
                  <div className="relative h-72 overflow-hidden bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted to-background" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/72 via-black/8 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="text-2xl font-semibold tracking-tight text-white">{item.name}</div>
                      {item.headline ? (
                        <div className="mt-2 line-clamp-2 text-sm text-white/80">{item.headline}</div>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  {item.bio ? (
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.bio}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-3 py-1">{item.mediaCount} linked media</span>
                    {item.aliases.slice(0, 3).map((alias) => (
                      <span key={`${item.id}-${alias}`} className="rounded-full border px-3 py-1">
                        {alias}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/people/${item.slug}`}
                      className="inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      Open profile
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}