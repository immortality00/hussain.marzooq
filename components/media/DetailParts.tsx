"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Appearance, MediaPerson, TagLink } from "./types";
import { appearanceLines, formatDates } from "./utils";

const CHIP = "rounded-full border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground";
const LINK_CHIP = `${CHIP} transition-colors hover:bg-foreground hover:text-background`;

/** The people on an item, each linked to their profile — except on that profile's own page. */
export function PeopleChips({ people }: { people: MediaPerson[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {people.map((person, index) => {
        const href = person.slug ? `/people/${person.slug}` : null;
        const key = `${index}:${person.name}`;
        return href && href !== pathname ? (
          <Link key={key} href={href} className={LINK_CHIP}>
            {person.name}
          </Link>
        ) : (
          <span key={key} className={CHIP}>
            {person.name}
          </span>
        );
      })}
    </div>
  );
}

/** Tags by name, each opening its page. */
export function TagChips({ tags }: { tags: TagLink[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag.href} href={tag.href} className={LINK_CHIP}>
          {tag.label}
        </Link>
      ))}
    </div>
  );
}

/** Labelled facts — Year, Location, Event — one row each; rows without a value aren't drawn. */
export function DetailRows({ rows }: { rows: [label: string, value: string | null | undefined][] }) {
  const shown = rows.filter((row): row is [string, string] => Boolean(row[1]));
  if (!shown.length) return null;
  return (
    <dl className="space-y-2.5 text-sm">
      {shown.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
          <dd className="wrap-anywhere text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Exhibitions or features, one after another, each line shown only when it has something in it. */
export function AppearanceEntries({ items }: { items: Appearance[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((a, index) => {
        const { heading, place } = appearanceLines(a);
        const dates = formatDates(a);
        return (
          <div key={index} className="space-y-1 py-3 first:pt-0 last:pb-0">
            {heading ? <div className="text-sm font-medium wrap-anywhere">{heading}</div> : null}
            {place ? <div className="text-xs text-muted-foreground wrap-anywhere">{place}</div> : null}
            {dates ? <div className="text-xs text-muted-foreground">{dates}</div> : null}
            {a.notes ? <div className="pt-1 text-xs whitespace-pre-wrap leading-relaxed wrap-anywhere">{a.notes}</div> : null}
            {a.link ? (
              <a
                href={a.link}
                target="_blank"
                rel="noreferrer"
                data-no-transition
                className="inline-flex pt-1 text-xs underline underline-offset-2"
              >
                Link
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
