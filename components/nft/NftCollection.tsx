"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import NftCard from "./NftCard";
import NftFilters from "./NftFilters";
import NftModal from "./NftModal";
import { displayStatus } from "./lib";

export default function NftCollection({ items }: { items: PublicNftItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "available" | "sold" | "coming-soon">("");
  const [active, setActive] = useState<PublicNftItem | null>(null);

  useEffect(() => {
    if (active) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = q
        ? `${item.title} ${item.description ?? ""} ${item.tags.join(" ")} ${item.people.join(" ")}`
            .toLowerCase()
            .includes(q)
        : true;

      const shownStatus = displayStatus(item);
      const matchesStatus = statusFilter ? shownStatus === statusFilter : true;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  return (
    <div className="mt-10 space-y-6">
      <NftFilters
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border p-8 text-sm text-muted-foreground">
          No NFT items match these filters.
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <NftCard key={item.id} item={item} onOpen={setActive} />
          ))}
        </section>
      )}

      {active ? <NftModal item={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}