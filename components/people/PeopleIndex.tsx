"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "@/components/search/SearchInput";
import type { PublicPersonIndexItem } from "@/lib/server/public-people";

export default function PeopleIndex({ items }: { items: PublicPersonIndexItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const text = `${item.name} ${item.bio ?? ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [items, query]);

  return (
    <div className="mt-10 space-y-6">
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search people..."
        resultText={`${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
      />

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border p-8 text-sm text-muted-foreground">
          No people match this search.
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-[1.75rem] border bg-background/60 p-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                  {item.avatarUrl || item.featuredImage ? (
                    <Image
                      src={item.avatarUrl || item.featuredImage || ""}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>

                <h2 className="mt-3 text-lg font-semibold tracking-tight">{item.name}</h2>

                {item.bio ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {item.bio}
                  </p>
                ) : null}

                <div className="mt-4 flex w-full gap-2">
                  <div className="min-w-0 flex-1 rounded-2xl border px-3 py-2 text-center">
                    <div className="text-base font-semibold">{item.photoCount}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      photos
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 rounded-2xl border px-3 py-2 text-center">
                    <div className="text-base font-semibold">{item.videoCount}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      videos
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <Link
                    href={`/people/${item.slug}`}
                    className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                  >
                    Open profile
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}