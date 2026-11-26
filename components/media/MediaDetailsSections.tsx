"use client";

import type { MediaItem, TagLinks } from "./types";
import { AppearanceEntries, DetailRows, PeopleChips, TagChips } from "./DetailParts";
import { tagChipsOf, tagDisciplineOf } from "./utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-background/50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** The popup's side panel: the year, place and event are here, once (not under the title). */
export default function MediaDetailsSections({
  active,
  tagLinks,
}: {
  active: MediaItem;
  tagLinks?: TagLinks;
}) {
  const exhibited = (active.appearances ?? []).filter((a) => a.kind === "exhibited");
  const featured = (active.appearances ?? []).filter((a) => a.kind === "featured");
  const tags = tagChipsOf(active.tags ?? [], tagLinks, tagDisciplineOf(active.type));
  const hasDetails = Boolean(active.year || active.location || active.event);

  return (
    <div className="space-y-4">
      {active.description ? (
        <Section title="Description">
          <div className="text-sm whitespace-pre-wrap leading-relaxed wrap-anywhere">{active.description}</div>
        </Section>
      ) : null}

      {hasDetails ? (
        <Section title="Details">
          <DetailRows
            rows={[
              ["Year", active.year ? String(active.year) : null],
              ["Location", active.location],
              ["Event", active.event],
            ]}
          />
        </Section>
      ) : null}

      {active.people?.length ? (
        <Section title="People">
          <PeopleChips people={active.people} />
        </Section>
      ) : null}

      {tags.length ? (
        <Section title="Tags">
          <TagChips tags={tags} />
        </Section>
      ) : null}

      {exhibited.length ? (
        <Section title="Exhibited">
          <AppearanceEntries items={exhibited} />
        </Section>
      ) : null}

      {featured.length ? (
        <Section title="Featured">
          <AppearanceEntries items={featured} />
        </Section>
      ) : null}
    </div>
  );
}
