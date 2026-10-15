import type { Db, ObjectId } from "mongodb";
import { resolvePeopleSelection } from "@/app/api/_lib/media";
import { getPrivateGalleryTitlesForMedia } from "@/lib/server/private-gallery-admin";
import type { MediaPatchInput } from "./parse-media-patch";

export type MediaSet = Record<string, unknown>;

export async function buildMediaSet(db: Db, oid: ObjectId, input: MediaPatchInput): Promise<MediaSet> {
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds: input.peopleIds });
  const galleryTitles = await getPrivateGalleryTitlesForMedia(db, String(oid));
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

  if (resolvedPeople.gatedPersonName || galleryTitles.length > 0) {
    set.isPublic = false;
  } else if (typeof input.isPublic === "boolean") {
    set.isPublic = input.isPublic;
  }

  return set;
}
