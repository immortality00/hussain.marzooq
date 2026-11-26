import type { Appearance, MediaItem, TagLink, TagLinks } from "./types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Renders a stored "YYYY-MM" value (from the appearance month picker) as
// "Month YYYY". Anything that doesn't match is returned as-is so legacy or
// partial values still display.
export function formatMonthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const month = MONTH_NAMES[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

export function formatPlace(a: Appearance) {
  return [a.venue, a.city, a.country].filter(Boolean).join(" • ");
}

export function formatDates(a: Appearance) {
  return [a.dateFrom, a.dateTo].filter(Boolean).map(formatMonthYear).join(" → ");
}
/** The line under a card's title: year • place • event, empty when none is set. */
export function mediaMetaLine(item: { year: number | null; location: string | null; event: string | null }) {
  return [item.year ? String(item.year) : "", item.location ?? "", item.event ?? ""].filter(Boolean).join(" • ");
}

/**
 * An appearance's heading and place line. The heading is its title, or — for an entry saved
 * without one — the first place part, which then isn't repeated in the place line.
 */
export function appearanceLines(a: Appearance): { heading: string; place: string } {
  const parts = [a.venue, a.city, a.country].filter(Boolean);
  if (a.title) return { heading: a.title, place: parts.join(" • ") };
  const [heading = "", ...rest] = parts;
  return { heading, place: rest.join(" • ") };
}

export type TagDiscipline = keyof TagLinks;

/** Which discipline's tag pages an item's tags open: a photo's are Photography's, a film's Videography's. */
export function tagDisciplineOf(type: string): TagDiscipline {
  return type === "image" ? "photography" : "videography";
}

/** The item's tags that have a page, as their names and links. A tag with no public page isn't shown. */
export function tagChipsOf(tags: string[], links: TagLinks | undefined, discipline: TagDiscipline): TagLink[] {
  const pages = links?.[discipline];
  if (!pages) return [];
  const seen = new Set<string>();
  return tags.flatMap((slug) => {
    const page = pages[slug];
    if (!page || seen.has(slug)) return [];
    seen.add(slug);
    return [page];
  });
}

/** The picture a media popup opens with: the photo, or a video link's stored poster (an uploaded video has none). */
export function popupImageOf(item: Pick<MediaItem, "type" | "secureUrl" | "embedUrl" | "posterUrl">): string | null {
  if (item.type === "embed" && item.embedUrl) return item.posterUrl;
  if (item.type === "video" && item.secureUrl) return null;
  return item.secureUrl;
}
