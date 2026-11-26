"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import type { TagLinks } from "@/components/media/types";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import { usePopupSequence } from "@/components/shared/popup-sequence/usePopupSequence";
import { NFT_POPUP_IMAGE_SIZES, preloadPopupImage } from "@/lib/client/preload-popup-image";
import NftCard from "./NftCard";
import NftFilters, { type StatusFilter } from "./NftFilters";
import NftModal from "./NftModal";
import { NoResults } from "@/components/shared/NoResults";
import { displayStatus } from "./lib";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useEntryMemory } from "@/hooks/useEntryMemory";

const EAGER_GRID_IMAGE_COUNT = 3;

function preloadNftPopup(item: PublicNftItem) {
  preloadPopupImage(item.mediaType === "video" ? null : item.mediaUrl, NFT_POPUP_IMAGE_SIZES);
}

export default function NftCollection({ items, tagLinks }: { items: PublicNftItem[]; tagLinks?: TagLinks }) {
  const { restored, remember } = useEntryMemory<{ query: string; status: StatusFilter }>("nft-collection");
  const search = useDebouncedSearch(restored?.query);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(restored?.status ?? "");

  useEffect(
    () => remember({ query: search.text, status: statusFilter }),
    [remember, search.text, statusFilter],
  );

  const query = search.query;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = q
        ? `${item.title} ${item.description ?? ""} ${item.tags.join(" ")} ${item.people.map((person) => person.name).join(" ")}`
            .toLowerCase()
            .includes(q)
        : true;

      const shownStatus = displayStatus(item);
      const matchesStatus = statusFilter ? shownStatus === statusFilter : true;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);
  const popup = usePopupSequence(filtered, { preload: preloadNftPopup });

  useModalNavbarLock(Boolean(popup.active));

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
              onOpen={popup.open}
              loadImageEagerly={index < EAGER_GRID_IMAGE_COUNT}
            />
          ))}
        </section>
      )}

      {popup.active ? (
        <NftModal item={popup.active} nav={popup.nav} onClose={popup.close} tagLinks={tagLinks} />
      ) : null}
    </div>
  );
}