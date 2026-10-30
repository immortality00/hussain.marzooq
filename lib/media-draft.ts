import { formatMonthYear } from "@/components/media/utils";

// A blog draft built from a media item's own fields (U7). Fixed wording, no AI; an empty
// field is left out, never filled in.

export type DraftPerson = { name: string; slug: string };
export type DraftTag = { label: string; href: string | null };
export type DraftAppearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  link: string;
};
export type DraftNft = {
  editionType: "1/1" | "limited" | "open";
  editionsTotal: number | null;
  price: number | null;
  currency: string;
  status: "available" | "sold" | "coming-soon";
};

export type DraftMedia = {
  id: string;
  kind: "image" | "video" | "embed";
  title: string;
  description: string;
  event: string;
  location: string;
  year: number | null;
  /** The photo, a video's first frame or a video link's stored thumbnail; "" when there is none. */
  imageUrl: string;
  /** Where a film plays: the videography page or the YouTube/Vimeo page; "" for a photo. */
  watchUrl: string;
  /** Public profiles only. */
  people: DraftPerson[];
  /** Active tags only; `href` is the tag's page when the item has one. */
  tags: DraftTag[];
  appearances: DraftAppearance[];
  nft: DraftNft | null;
};

export type MediaDraft = {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
};

const EXCERPT_MAX = 200;

/** Text shown as typed: characters markdown would read as formatting are escaped. */
export function mdText(value: string) {
  return value
    .replace(/[\\`*_[\]<>~|]/g, "\\$&")
    .replace(/^(\s*)([#+-])(?=\s)/gm, "$1\\$2")
    .replace(/^(\s*\d+)\.(?=\s)/gm, "$1\\.");
}

function placeLine(item: Pick<DraftMedia, "event" | "location" | "year">) {
  const where = [item.location, item.year ? String(item.year) : ""].filter(Boolean).join(", ");
  if (item.event && where) return `${item.event} — ${where}`;
  return item.event || where;
}

function firstSentence(text: string) {
  const sentence = text.trim().split(/(?<=[.!?])\s+/)[0] ?? "";
  if (sentence.length <= EXCERPT_MAX) return sentence;
  const cut = sentence.slice(0, EXCERPT_MAX);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : EXCERPT_MAX)}…`;
}

function dates(a: DraftAppearance) {
  const from = a.dateFrom ? formatMonthYear(a.dateFrom) : "";
  const to = a.dateTo && a.dateTo !== a.dateFrom ? formatMonthYear(a.dateTo) : "";
  return [from, to].filter(Boolean).join(" – ");
}

function appearanceLine(a: DraftAppearance) {
  const title = a.link ? `[${mdText(a.title)}](${a.link})` : mdText(a.title);
  const place = a.kind === "exhibited" ? [a.venue, a.city, a.country].filter(Boolean).join(", ") : "";
  const when = dates(a);
  return `- ${title}${place ? ` — ${mdText(place)}` : ""}${when ? ` · ${when}` : ""}`;
}

function nftLine(nft: DraftNft) {
  const edition =
    nft.editionType === "1/1"
      ? "1 of 1"
      : nft.editionType === "limited" && nft.editionsTotal
        ? `Edition of ${nft.editionsTotal}`
        : nft.editionType === "open"
          ? "Open edition"
          : "";
  const price = nft.price !== null ? `${nft.price} ${nft.currency}` : "";
  const status = nft.status === "sold" ? "Sold" : nft.status === "coming-soon" ? "Coming soon" : "";
  return [edition, price, status].filter(Boolean).join(" · ");
}

function unique<T>(items: T[], keyOf: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function image(item: DraftMedia) {
  return item.imageUrl ? `![${mdText(item.title)}](${item.imageUrl})` : "";
}

function watchLink(item: DraftMedia) {
  return item.watchUrl ? `[Watch the film](${item.watchUrl})` : "";
}

/** Each item's own part; the cover's picture is already shown above the text, so it isn't repeated. */
function itemBlocks(items: DraftMedia[], cover: string) {
  if (items.length === 1) {
    const [item] = items as [DraftMedia];
    return [item.imageUrl === cover ? "" : image(item), mdText(item.description), watchLink(item)];
  }
  return items.flatMap((item) => [
    item.imageUrl === cover ? "" : image(item),
    `*${mdText(item.title)}*`,
    mdText(item.description),
    watchLink(item),
  ]);
}

/** What the items share: a batch shares its event, place, people, tags and exhibitions. */
function sharedBlocks(items: DraftMedia[]) {
  const first = items[0]!;
  const people = unique(items.flatMap((item) => item.people), (p) => p.slug);
  const appearances = unique(
    items.flatMap((item) => item.appearances),
    (a) => `${a.kind}|${a.title}|${a.dateFrom}`
  );
  const exhibited = appearances.filter((a) => a.kind === "exhibited");
  const featured = appearances.filter((a) => a.kind === "featured");
  const tag = items.flatMap((item) => item.tags).find((t) => t.href);
  const nfts = items.flatMap((item) => (item.nft ? [nftLine(item.nft)] : [])).filter(Boolean);
  const place = placeLine(first);

  return [
    place ? `${mdText(place)}.` : "",
    people.length ? `**With** ${people.map((p) => `[${mdText(p.name)}](/people/${p.slug})`).join(" · ")}` : "",
    exhibited.length ? `**Exhibited**\n\n${exhibited.map(appearanceLine).join("\n")}` : "",
    featured.length ? `**Featured**\n\n${featured.map(appearanceLine).join("\n")}` : "",
    nfts.length ? `${nfts.map(mdText).join("\n\n")}\n\n[View the collection](/nft)` : "",
    tag?.href ? `[More ${mdText(tag.label)}](${tag.href})` : "",
  ];
}

/** Items added to a draft that was already edited: each one's picture and text, appended as is. */
export function addedItemsContent(items: DraftMedia[]) {
  return items
    .flatMap((item) => [image(item), `*${mdText(item.title)}*`, mdText(item.description), watchLink(item)])
    .filter(Boolean)
    .join("\n\n");
}

function coverOf(items: DraftMedia[]) {
  return items.find((item) => item.imageUrl)?.imageUrl ?? "";
}

export function draftContent(items: DraftMedia[]) {
  return [...itemBlocks(items, coverOf(items)), ...sharedBlocks(items)].filter(Boolean).join("\n\n");
}

function draftExcerpt(items: DraftMedia[]) {
  const first = items[0]!;
  const place = placeLine(first);
  if (items.length === 1) {
    const sentence = firstSentence(first.description);
    if (sentence) return sentence;
    return place ? `${place}.` : "";
  }
  if (first.event) return `${items.length} frames from ${place}.`;
  return place ? `${items.length} frames — ${place}.` : "";
}

export function buildMediaDraft(items: DraftMedia[]): MediaDraft {
  if (items.length === 0) throw new Error("A draft needs at least one item.");
  const first = items[0]!;
  return {
    title: items.length > 1 && first.event ? first.event : first.title,
    excerpt: draftExcerpt(items),
    content: draftContent(items),
    coverImageUrl: coverOf(items),
    tags: unique(items.flatMap((item) => item.tags.map((t) => t.label)), (label) => label),
  };
}
