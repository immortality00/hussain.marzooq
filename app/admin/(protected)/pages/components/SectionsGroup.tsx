"use client";

import { LayoutGrid, Megaphone } from "lucide-react";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { GroupCard } from "./GroupCard";
import { HomeSectionsForm } from "./HomeSectionsForm";
import { CardsCtaForm } from "./CardsCtaForm";
import { CtaOnlyForm } from "./CtaOnlyForm";
import { DancingSectionsForm } from "./DancingSectionsForm";
import { WebDevSectionsForm } from "./WebDevSectionsForm";

type AnySections = PageSectionsMap[PageSectionsSlug];

const CTA_ONLY_SLUGS: PageSectionsSlug[] = [
  "photography",
  "videography",
  "nft",
  "blog",
  "people",
  "people-detail",
  "testimonials",
];

function SectionForm({
  slug,
  data,
  onChange,
}: {
  slug: PageSectionsSlug;
  data: AnySections;
  onChange: (data: AnySections) => void;
}) {
  switch (slug) {
    case "home":
      return <HomeSectionsForm data={data as PageSectionsMap["home"]} onChange={onChange} />;
    case "about": {
      const d = data as PageSectionsMap["about"];
      return (
        <CardsCtaForm
          cardsTitle="Disciplines"
          cards={d.disciplines}
          cta={d.stickyCta}
          onCardsChange={(cards) => onChange({ ...d, disciplines: cards })}
          onCtaChange={(cta) => onChange({ ...d, stickyCta: cta })}
        />
      );
    }
    case "dancing":
      return <DancingSectionsForm data={data as PageSectionsMap["dancing"]} onChange={onChange} />;
    case "web-development":
      return (
        <WebDevSectionsForm data={data as PageSectionsMap["web-development"]} onChange={onChange} />
      );
    case "photography":
    case "videography":
    case "nft":
    case "blog":
    case "people":
    case "people-detail":
    case "testimonials":
      return <CtaOnlyForm data={data as PageSectionsMap["nft"]} onChange={onChange} />;
  }
}

export function SectionsGroup({
  slug,
  data,
  onChange,
}: {
  slug: PageSectionsSlug;
  data: AnySections;
  onChange: (data: AnySections) => void;
}) {
  const ctaOnly = CTA_ONLY_SLUGS.includes(slug);
  return (
    <GroupCard
      icon={ctaOnly ? Megaphone : LayoutGrid}
      label={ctaOnly ? "CTA" : "Sections"}
      tint="sections"
    >
      <SectionForm slug={slug} data={data} onChange={onChange} />
    </GroupCard>
  );
}
