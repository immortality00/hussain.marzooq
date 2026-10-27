import type { Db, ObjectId } from "mongodb";
import { resolvePeopleSelection } from "@/app/api/_lib/media";
import { getPrivateGalleryTitlesForMedia } from "@/lib/server/private-gallery-admin";
import type { MediaPatchInput } from "./parse-media-patch";

export type MediaSet = Record<string, unknown>;

// A media item linked to a hidden or password-protected person, or inside a Private Gallery, can't be public.
export async function mustStayHidden(db: Db, oid: ObjectId, gatedPersonName: string | null) {
  if (gatedPersonName) return true;
  return (await getPrivateGalleryTitlesForMedia(db, String(oid))).length > 0;
}

export async function buildMediaSet(db: Db, oid: ObjectId, input: MediaPatchInput): Promise<MediaSet> {
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds: input.peopleIds });
  const hiddenByRule = await mustStayHidden(db, oid, resolvedPeople.gatedPersonName);
  const { mediaLocation } = input;

  const set: MediaSet = {
    title: input.title,
    description: input.description || null,
    location: mediaLocation.location,
    locationId: mediaLocation.locationId,
    locationLat: mediaLocation.locationLat,
    locationLon: mediaLocation.locationLon,
    locationCountryCode: mediaLocation.locationCountryCode,
    event: input.event || null,
    year: input.year,
    tags: input.tags,
    categories: input.categories,
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people,
    appearances: input.appearances,
    nft: input.nft,
    updatedAt: new Date(),
  };

  if (hiddenByRule) {
    set.isPublic = false;
  } else if (typeof input.isPublic === "boolean") {
    set.isPublic = input.isPublic;
  }

  return set;
}
