"use client";

import type { ReactNode } from "react";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import type { TagLinks } from "@/components/media/types";
import { AppearanceEntries, DetailRows, PeopleChips, TagChips } from "@/components/media/DetailParts";
import { tagChipsOf, tagDisciplineOf } from "@/components/media/utils";
import { editionLabel, editionSubline } from "./lib";
import { NftPrice } from "./NftPrice";

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-background/50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** The NFT popup's side panel. Its status sits on the artwork, as on the card. */
export function NftDetails({ item, tagLinks }: { item: PublicNftItem; tagLinks?: TagLinks }) {
  const tags = tagChipsOf(item.tags, tagLinks, tagDisciplineOf(item.mediaType));
  const exhibited = item.appearances.filter((a) => a.kind === "exhibited");
  const featured = item.appearances.filter((a) => a.kind === "featured");

  return (
    <div className="space-y-5">
      {item.description ? (
        <Box title="Description">
          <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground wrap-anywhere">
            {item.description}
          </div>
        </Box>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Box title="Price">
          <div className="text-lg font-semibold">
            <NftPrice item={item} />
          </div>
        </Box>
        <Box title="Edition">
          <div className="text-lg font-semibold">{editionLabel(item)}</div>
          <div className="mt-1 text-sm text-muted-foreground">{editionSubline(item)}</div>
        </Box>
      </div>

      <Box title="Details">
        <DetailRows
          rows={[
            ["Year", item.year ? String(item.year) : null],
            ["Currency", item.nft.currency],
            ["Location", item.location],
            ["Event", item.event],
          ]}
        />
      </Box>

      {item.people.length ? (
        <Box title="People">
          <PeopleChips people={item.people} />
        </Box>
      ) : null}

      {tags.length ? (
        <Box title="Tags">
          <TagChips tags={tags} />
        </Box>
      ) : null}

      {exhibited.length ? (
        <Box title="Exhibited">
          <AppearanceEntries items={exhibited} />
        </Box>
      ) : null}

      {featured.length ? (
        <Box title="Featured">
          <AppearanceEntries items={featured} />
        </Box>
      ) : null}
    </div>
  );
}
