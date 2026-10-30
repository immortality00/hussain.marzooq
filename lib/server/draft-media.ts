import { ObjectId, type Db, type Document } from "mongodb";
import { asString } from "@/app/api/_lib/common";
import { VIDEO_COVER_TRANSFORM, videoFrameUrl } from "@/lib/cloudinary-delivery";
import type { DraftAppearance, DraftMedia, DraftNft } from "@/lib/media-draft";
import { parseVideoLink, videoWatchUrl } from "@/lib/video-embed";

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function tagHref(categories: string[], slug: string) {
  if (categories.includes("photography")) return `/photography/${slug}`;
  if (categories.includes("videography")) return `/videography/${slug}`;
  return null;
}

function appearancesOf(value: unknown): DraftAppearance[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const a = entry as Document;
    const title = asString(a.title).trim();
    if (!title || (a.kind !== "featured" && a.kind !== "exhibited")) return [];
    return [
      {
        kind: a.kind,
        title,
        venue: asString(a.venue).trim(),
        city: asString(a.city).trim(),
        country: asString(a.country).trim(),
        dateFrom: asString(a.dateFrom).trim(),
        dateTo: asString(a.dateTo).trim(),
        link: asString(a.link).trim(),
      },
    ];
  });
}

function nftOf(doc: Document): DraftNft | null {
  if (!strings(doc.categories).includes("nft") || !doc.nft || typeof doc.nft !== "object") return null;
  const nft = doc.nft as Document;
  return {
    editionType: nft.editionType === "limited" || nft.editionType === "open" ? nft.editionType : "1/1",
    editionsTotal: typeof nft.editionsTotal === "number" ? nft.editionsTotal : null,
    price: typeof nft.price === "number" ? nft.price : null,
    currency: asString(nft.currency),
    status: nft.status === "sold" || nft.status === "coming-soon" ? nft.status : "available",
  };
}

function pictureOf(doc: Document) {
  if (doc.type === "embed") {
    const video = parseVideoLink(asString(doc.embedUrl));
    return { kind: "embed" as const, imageUrl: asString(doc.posterUrl), watchUrl: video ? videoWatchUrl(video) : "" };
  }
  if (doc.type === "video") {
    return {
      kind: "video" as const,
      imageUrl: videoFrameUrl(asString(doc.secureUrl), VIDEO_COVER_TRANSFORM),
      watchUrl: "/videography",
    };
  }
  return { kind: "image" as const, imageUrl: asString(doc.secureUrl), watchUrl: "" };
}

/** The draft's view of each item: names only of public profiles, labels only of active tags. */
export async function loadDraftMedia(db: Db, docs: Document[]): Promise<DraftMedia[]> {
  const peopleIds = Array.from(new Set(docs.flatMap((doc) => strings(doc.peopleIds)))).filter((id) =>
    ObjectId.isValid(id)
  );
  const tagSlugs = Array.from(new Set(docs.flatMap((doc) => strings(doc.tags))));

  const [people, tags] = await Promise.all([
    peopleIds.length
      ? db
          .collection("people_profiles")
          .find(
            { _id: { $in: peopleIds.map((id) => new ObjectId(id)) }, isPublic: true, isPrivate: { $ne: true } },
            { projection: { name: 1, slug: 1 } }
          )
          .toArray()
      : [],
    tagSlugs.length
      ? db
          .collection("media_tags")
          .find({ slug: { $in: tagSlugs }, isActive: { $ne: false } }, { projection: { slug: 1, label: 1 } })
          .toArray()
      : [],
  ]);
  const personById = new Map(people.map((p) => [String(p._id), p]));
  const labelBySlug = new Map(tags.map((t) => [asString(t.slug), asString(t.label) || asString(t.slug)]));

  return docs.map((doc) => {
    const categories = strings(doc.categories);
    return {
      id: String(doc._id),
      ...pictureOf(doc),
      title: asString(doc.title).trim() || "Untitled",
      description: asString(doc.description).trim(),
      event: asString(doc.event).trim(),
      location: asString(doc.location).trim(),
      year: typeof doc.year === "number" ? doc.year : null,
      people: strings(doc.peopleIds).flatMap((id) => {
        const person = personById.get(id);
        const slug = person ? asString(person.slug) : "";
        return person && slug ? [{ name: asString(person.name).trim() || slug, slug }] : [];
      }),
      tags: strings(doc.tags).flatMap((slug) => {
        const label = labelBySlug.get(slug);
        return label ? [{ label, href: tagHref(categories, slug) }] : [];
      }),
      appearances: appearancesOf(doc.appearances),
      nft: nftOf(doc),
    };
  });
}

/** The items in the order given, then the draft fields built from them; null when none is left. */
export async function draftFieldsFor(db: Db, mediaIds: string[]) {
  const objectIds = mediaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const found = await db.collection("media").find({ _id: { $in: objectIds } }).toArray();
  const byId = new Map(found.map((doc) => [String(doc._id), doc]));
  const docs = mediaIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  if (docs.length === 0) return null;
  return { ids: docs.map((doc) => String(doc._id)), items: await loadDraftMedia(db, docs) };
}
