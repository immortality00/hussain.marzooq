"use client";

import { useMemo, useState } from "react";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import NftCard from "./NftCard";
import NftFilters from "./NftFilters";
import NftModal from "./NftModal";
import { NoResults } from "@/components/shared/NoResults";
import { displayStatus } from "./lib";

const EAGER_GRID_IMAGE_COUNT = 3;

export default function NftCollection({ items }: { items: PublicNftItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "available" | "sold" | "coming-soon">("");
  const [active, setActive] = useState<PublicNftItem | null>(null);

  useModalNavbarLock(Boolean(active));

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
        <NoResults>No NFT items match these filters.</NoResults>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <NftCard
              key={item.id}
              item={item}
              onOpen={setActive}
              loadImageEagerly={index < EAGER_GRID_IMAGE_COUNT}
            />
          ))}
        </section>
      )}

      {active ? <NftModal item={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}