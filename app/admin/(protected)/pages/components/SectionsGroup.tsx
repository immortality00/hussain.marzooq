"use client";

import { LayoutGrid } from "lucide-react";
import type { PageSectionsSlug, PageSectionsMap } from "@/lib/server/page-sections";
import { GroupCard } from "./GroupCard";
import { HomeSectionsForm } from "./HomeSectionsForm";
import { AboutSectionsForm } from "./AboutSectionsForm";
import { DancingSectionsForm } from "./DancingSectionsForm";
import { WebDevSectionsForm } from "./WebDevSectionsForm";
import { BlogSectionsForm } from "./BlogSectionsForm";
import { CtaOnlyForm } from "./CtaOnlyForm";

function SectionForm({
  slug,
  data,
  onChange,
}: {
  slug: PageSectionsSlug;
  data: PageSectionsMap[PageSectionsSlug];
  onChange: (data: PageSectionsMap[PageSectionsSlug]) => void;
}) {
  switch (slug) {
    case "home":
      return <HomeSectionsForm data={data as PageSectionsMap["home"]} onChange={onChange} />;
    case "about":
      return <AboutSectionsForm data={data as PageSectionsMap["about"]} onChange={onChange} />;
    case "dancing":
      return <DancingSectionsForm data={data as PageSectionsMap["dancing"]} onChange={onChange} />;
    case "web-development":
      return (
        <WebDevSectionsForm data={data as PageSectionsMap["web-development"]} onChange={onChange} />
      );
    case "blog":
      return <BlogSectionsForm data={data as PageSectionsMap["blog"]} onChange={onChange} />;
    case "nft":
    case "people":
    case "people-detail":
      return <CtaOnlyForm data={data as PageSectionsMap["nft"]} onChange={onChange} />;
  }
}

export function SectionsGroup({
  slug,
  data,
  onChange,
}: {
  slug: PageSectionsSlug;
  data: PageSectionsMap[PageSectionsSlug];
  onChange: (data: PageSectionsMap[PageSectionsSlug]) => void;
}) {
  return (
    <GroupCard icon={LayoutGrid} label="Sections" tint="sections">
      <SectionForm slug={slug} data={data} onChange={onChange} />
    </GroupCard>
  );
}
