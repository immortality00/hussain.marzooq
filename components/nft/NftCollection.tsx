"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import NftCard from "./NftCard";
import NftFilters, { type StatusFilter } from "./NftFilters";
import NftModal from "./NftModal";
import { NoResults } from "@/components/shared/NoResults";
import { displayStatus } from "./lib";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useEntryMemory } from "@/hooks/useEntryMemory";

const EAGER_GRID_IMAGE_COUNT = 3;

export default function NftCollection({ items }: { items: PublicNftItem[] }) {
  const { restored, remember } = useEntryMemory<{ query: string; status: StatusFilter }>("nft-collection");
  const search = useDebouncedSearch(restored?.query);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(restored?.status ?? "");
  const [active, setActive] = useState<PublicNftItem | null>(null);

  useModalNavbarLock(Boolean(active));

  useEffect(
    () => remember({ query: search.text, status: statusFilter }),
    [remember, search.text, statusFilter],
  );

  const query = search.query;
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
        query={search.text}
        setQuery={search.setText}
        clearQuery={search.clear}
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