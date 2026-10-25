"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChipScroller } from "@/components/shared/ChipScroller";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { chipClasses } from "@/components/shared/chip-classes";

export type ServiceTab = { slug: string; name: string };
export type ServiceCardNode = { id: string; category: string; node: ReactNode };

type ServicesViewProps = {
  tabs: ServiceTab[];
  cards: ServiceCardNode[];
  empty: ReactNode;
};

export function ServicesView({ category, tabs, cards, empty }: ServicesViewProps & { category: string }) {
  const visible =
    category === "all" ? cards : cards.filter((card) => card.category.toLowerCase() === category.toLowerCase());

  return (
    <>
      <StickyToolbar className="mt-8">
        <ChipScroller>
          {tabs.map((t) => (
            <Link
              key={t.slug}
              href={t.slug === "all" ? "/services" : `/services?category=${encodeURIComponent(t.slug)}`}
              className={chipClasses(t.slug === category, "shrink-0 whitespace-nowrap")}
            >
              {t.name}
            </Link>
          ))}
        </ChipScroller>
      </StickyToolbar>

      {visible.length === 0 ? (
        empty
      ) : (
        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((card) => (
            <Fragment key={card.id}>{card.node}</Fragment>
          ))}
        </section>
      )}
    </>
  );
}

export function ServicesFilter(props: ServicesViewProps) {
  const category = useSearchParams().get("category") ?? "all";
  return <ServicesView category={category} {...props} />;
}
