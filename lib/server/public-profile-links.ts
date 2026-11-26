import { ObjectId, type Db } from "mongodb";
import { storedList } from "@/lib/linked-people";

/** A profile visitors can open: listed on /people, not hidden and not password-protected. */
export const PUBLIC_PROFILE_FILTER = {
  $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  isPrivate: { $ne: true },
};

const PROFILE_ID = /^[a-f0-9]{24}$/i;

/**
 * The address of every public profile the given media link to, by profile id, in one read
 * for any number of items. A hidden or password-protected profile is never in it, so no
 * page can link to one, whatever an item says.
 */
export async function publicProfileSlugs(db: Db, docs: Record<string, unknown>[]): Promise<Map<string, string>> {
  const ids = new Set<string>();
  for (const doc of docs) {
    for (const id of storedList(doc.peopleIds)) if (PROFILE_ID.test(id)) ids.add(id);
  }
  if (ids.size === 0) return new Map();

  const profiles = await db
    .collection("people_profiles")
    .find({ _id: { $in: [...ids].map((id) => new ObjectId(id)) }, ...PUBLIC_PROFILE_FILTER })
    .project({ slug: 1 })
    .toArray();

  const slugs = new Map<string, string>();
  for (const profile of profiles) {
    if (typeof profile.slug === "string" && profile.slug) slugs.set(String(profile._id), profile.slug);
  }
  return slugs;
}
