import { cookies } from "next/headers";
import { ObjectId, type Db, type Document, type Filter } from "mongodb";
import {
  getPersonGateSecret,
  personGateCookieName,
  verifyPersonGateCookieValue,
} from "@/lib/password-gate";
import { PUBLIC_MEDIA_VISIBILITY, releasedMediaFilter } from "@/lib/media-schedule";
import { privateGalleryMediaIds } from "@/lib/server/media-delivery";

const UNLOCKED_PAGE_LIMIT = 200;

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

export async function hasPersonGateAccess(person: Document) {
  const personId = String(person._id);
  const accessToken = typeof person.accessToken === "string" ? person.accessToken : "";
  if (!accessToken) return false;

  const jar = await cookies();
  const cookieValue = jar.get(personGateCookieName(personId))?.value ?? "";
  return verifyPersonGateCookieValue({ secret: getPersonGateSecret(), personId, accessToken, cookieValue });
}

export function personMediaQuery(personId: string, personName: string, includeHidden = false): Filter<Document> {
  const personMatch: Record<string, unknown>[] = [{ peopleIds: personId }];
  if (personName) personMatch.push({ people: personName });

  const clauses: Filter<Document>[] = [{ $or: personMatch }, releasedMediaFilter()];
  if (!includeHidden) clauses.push(PUBLIC_MEDIA_VISIBILITY);
  return { $and: clauses };
}

// Private-gallery media must never surface through a person's password gate, no matter
// why the rest of the gate is unlocked.
async function filterOutGalleryMedia(db: Db, mediaDocs: Document[]) {
  const inGallery = await privateGalleryMediaIds(db, mediaDocs.map((doc) => String(doc._id)));
  return inGallery.size ? mediaDocs.filter((doc) => !inGallery.has(String(doc._id))) : mediaDocs;
}

// A person's own gate unlocking their hidden media must not also reveal media that is
// hidden because a DIFFERENT, still-gated person appears in it — that person's privacy
// isn't this person's to unlock.
async function filterOutBlockedByOtherGatedPeople(db: Db, mediaDocs: Document[], ownerPersonId: string) {
  const hiddenDocs = mediaDocs.filter((doc) => doc.isPublic === false);
  if (hiddenDocs.length === 0) return mediaDocs;

  const otherIds = new Set<string>();
  for (const doc of hiddenDocs) {
    for (const pid of normalizeStringArray(doc.peopleIds)) {
      if (pid !== ownerPersonId) otherIds.add(pid);
    }
  }

  const objectIds = Array.from(otherIds)
    .filter((pid) => ObjectId.isValid(pid))
    .map((pid) => new ObjectId(pid));
  if (objectIds.length === 0) return mediaDocs;

  const gatedOthers = await db
    .collection("people_profiles")
    .find({ _id: { $in: objectIds }, $or: [{ isPublic: false }, { isPrivate: true }] })
    .project({ _id: 1 })
    .toArray();

  const gatedIds = new Set(gatedOthers.map((p) => String(p._id)));
  if (gatedIds.size === 0) return mediaDocs;

  return mediaDocs.filter((doc) => {
    if (doc.isPublic !== false) return true;
    const linkedIds = normalizeStringArray(doc.peopleIds);
    return !linkedIds.some((pid) => pid !== ownerPersonId && gatedIds.has(pid));
  });
}

// What an unlocked profile may show: the person's media, hidden items included.
export async function findUnlockedPersonMedia(
  db: Db,
  person: Document,
  extra: Filter<Document> | null = null,
  limit = UNLOCKED_PAGE_LIMIT
) {
  const personId = String(person._id);
  const name = typeof person.name === "string" ? person.name : "";
  const query = personMediaQuery(personId, name, true);

  const docs = await db
    .collection("media")
    .find(extra ? { $and: [query, extra] } : query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return filterOutBlockedByOtherGatedPeople(db, await filterOutGalleryMedia(db, docs), personId);
}

// The file route's person branch: the same rules as the unlocked page, for one item.
export async function personCanOpenMedia(db: Db, personSlug: string, mediaId: string) {
  if (!personSlug || !ObjectId.isValid(mediaId)) return false;

  const person = await db.collection("people_profiles").findOne({ slug: personSlug });
  if (!person || person.isPublic === false || person.isPrivate !== true) return false;
  if (!(await hasPersonGateAccess(person))) return false;

  const [doc] = await findUnlockedPersonMedia(db, person, { _id: new ObjectId(mediaId) }, 1);
  return Boolean(doc);
}
