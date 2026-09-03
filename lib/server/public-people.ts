import { cookies } from "next/headers";
import { sanitizeAppearances } from "@/app/api/_lib/media";
import type { MediaItem as PublicMediaItem } from "@/components/media/types";
import { getDb } from "@/lib/server/db";
import {
  getPersonGateSecret,
  personGateCookieName,
  verifyPersonGateCookieValue,
} from "@/lib/password-gate";

export type PublicPersonIndexItem = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  photoCount: number;
  videoCount: number;
  featuredImage: string | null;
};

export type PublicPersonDetail = PublicPersonIndexItem & {
  mediaItems: PublicMediaItem[];
};

export type PersonPageState =
  | { state: "missing" }
  | { state: "locked"; slug: string; name: string; bio: string | null; avatarUrl: string | null }
  | { state: "unavailable"; slug: string; name: string; avatarUrl: string | null }
  | { state: "open"; person: PublicPersonDetail };

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function toMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  return {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: normalizeStringArray(doc.tags),
    categories: normalizeStringArray(doc.categories),
    people: normalizeStringArray(doc.people),
    appearances: sanitizeAppearances(doc.appearances),
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : null,
  };
}

function isVideoType(value: unknown) {
  return typeof value === "string" && value === "video";
}

function isPersonGated(doc: Record<string, unknown>) {
  return doc.isPrivate === true;
}

function buildPersonMediaQuery(personId: string, personName: string, includeHidden = false) {
  const personMatch: Record<string, unknown>[] = [{ peopleIds: personId }];

  if (personName) {
    personMatch.push({ people: personName });
  }

  const clauses: Record<string, unknown>[] = [{ $or: personMatch }];
  if (!includeHidden) {
    clauses.push({ $or: [{ isPublic: true }, { isPublic: { $exists: false } }] });
  }

  return { $and: clauses };
}

async function buildPersonDetail(
  db: Awaited<ReturnType<typeof getDb>>,
  doc: Record<string, unknown>,
  includeHidden = false
): Promise<PublicPersonDetail> {
  const personId = String(doc._id);
  const name = typeof doc.name === "string" ? doc.name : "";

  const mediaDocs = await db
    .collection("media")
    .find(buildPersonMediaQuery(personId, name, includeHidden))
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const deduped = new Map<string, Record<string, unknown>>();
  for (const mediaDoc of mediaDocs) {
    deduped.set(String(mediaDoc._id), mediaDoc as Record<string, unknown>);
  }

  const mediaItems = Array.from(deduped.values()).map((item) => toMediaItem(item));

  return {
    id: personId,
    name,
    slug: typeof doc.slug === "string" ? doc.slug : "",
    bio: typeof doc.bio === "string" ? doc.bio : null,
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    photoCount: mediaItems.filter((item) => item.type !== "video").length,
    videoCount: mediaItems.filter((item) => item.type === "video").length,
    featuredImage:
      mediaItems.find((item) => typeof item.secureUrl === "string" && item.secureUrl)?.secureUrl ??
      null,
    mediaItems,
  };
}

async function getPublicPeopleImpl(): Promise<PublicPersonIndexItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("people_profiles")
    .find({
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
      isPrivate: { $ne: true },
    })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  if (docs.length === 0) return [];

  const ids = docs.map((doc) => String(doc._id));
  const names = docs
    .map((doc) => (typeof doc.name === "string" ? doc.name : ""))
    .filter((name) => name.length > 0);

  const nameToIds = new Map<string, string[]>();
  for (const doc of docs) {
    const name = typeof doc.name === "string" ? doc.name : "";
    if (!name) continue;
    const bucket = nameToIds.get(name) ?? [];
    bucket.push(String(doc._id));
    nameToIds.set(name, bucket);
  }
  const idSet = new Set(ids);

  const mediaDocs = await db
    .collection("media")
    .find({
      $and: [
        {
          $or: [
            { peopleIds: { $in: ids } },
            ...(names.length ? [{ people: { $in: names } }] : []),
          ],
        },
        { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] },
      ],
    })
    .project({ _id: 1, type: 1, secureUrl: 1, createdAt: 1, peopleIds: 1, people: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  type Accumulator = {
    photoCount: number;
    videoCount: number;
    featuredImage: string | null;
    seen: Set<string>;
  };
  const acc = new Map<string, Accumulator>();
  for (const id of ids) {
    acc.set(id, { photoCount: 0, videoCount: 0, featuredImage: null, seen: new Set() });
  }

  for (const media of mediaDocs) {
    const mediaId = String(media._id);
    const matched = new Set<string>();

    if (Array.isArray(media.peopleIds)) {
      for (const pid of media.peopleIds) {
        const key = String(pid);
        if (idSet.has(key)) matched.add(key);
      }
    }
    if (Array.isArray(media.people)) {
      for (const personName of media.people) {
        if (typeof personName !== "string") continue;
        for (const pid of nameToIds.get(personName) ?? []) matched.add(pid);
      }
    }

    if (matched.size === 0) continue;

    const isVideo = isVideoType(media.type);
    const url =
      typeof media.secureUrl === "string" && media.secureUrl.trim().length > 0
        ? media.secureUrl
        : null;

    for (const pid of matched) {
      const bucket = acc.get(pid);
      if (!bucket || bucket.seen.has(mediaId)) continue;
      bucket.seen.add(mediaId);
      if (isVideo) bucket.videoCount += 1;
      else bucket.photoCount += 1;
      if (!bucket.featuredImage && url) bucket.featuredImage = url;
    }
  }

  return docs.map((doc): PublicPersonIndexItem => {
    const personId = String(doc._id);
    const bucket = acc.get(personId);

    return {
      id: personId,
      name: typeof doc.name === "string" ? doc.name : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      bio: typeof doc.bio === "string" ? doc.bio : null,
      avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
      photoCount: bucket?.photoCount ?? 0,
      videoCount: bucket?.videoCount ?? 0,
      featuredImage: bucket?.featuredImage ?? null,
    };
  });
}

export async function getPublicPeople(): Promise<PublicPersonIndexItem[]> {
  try {
    return await getPublicPeopleImpl();
  } catch {
    return [];
  }
}

export async function getPublicPersonBySlug(slug: string): Promise<PublicPersonDetail | null> {
  try {
    const db = await getDb();

    const doc = await db.collection("people_profiles").findOne({
      slug,
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
      isPrivate: { $ne: true },
    });

    if (!doc) return null;

    return await buildPersonDetail(db, doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function getPersonPageBySlugImpl(slug: string): Promise<PersonPageState> {
  const db = await getDb();

  const doc = (await db.collection("people_profiles").findOne({ slug })) as Record<
    string,
    unknown
  > | null;

  if (!doc || doc.isPublic === false) return { state: "missing" };

  const name = typeof doc.name === "string" ? doc.name : "";
  const avatarUrl = typeof doc.avatarUrl === "string" ? doc.avatarUrl : null;
  const bio = typeof doc.bio === "string" ? doc.bio : null;

  if (!isPersonGated(doc)) {
    return { state: "open", person: await buildPersonDetail(db, doc) };
  }

  const personId = String(doc._id);
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const passwordHash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";

  const jar = await cookies();
  const cookieValue = jar.get(personGateCookieName(personId))?.value ?? "";
  const hasAccess =
    !!accessToken &&
    verifyPersonGateCookieValue({
      secret: getPersonGateSecret(),
      personId,
      accessToken,
      cookieValue,
    });

  if (hasAccess) {
    return { state: "open", person: await buildPersonDetail(db, doc, true) };
  }

  if (!passwordHash) {
    return { state: "unavailable", slug, name, avatarUrl };
  }

  return { state: "locked", slug, name, bio, avatarUrl };
}

export async function getPersonPageBySlug(slug: string): Promise<PersonPageState> {
  try {
    return await getPersonPageBySlugImpl(slug);
  } catch {
    return { state: "missing" };
  }
}
