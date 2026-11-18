import { describe, expect, it } from "vitest";
import { appearancesFrom, baseFieldsFrom, nftFieldsFrom } from "@/app/admin/(protected)/media/lib/editor-fields";
import { editorValuesKey, editorValuesOf, itemValuesKey } from "@/app/admin/(protected)/media/lib/media-fingerprint";
import type { MediaItem } from "@/app/admin/(protected)/media/lib/types";

const item: MediaItem = {
  id: "m1",
  type: "image",
  title: "Seed Photo 36",
  description: "On set.",
  location: "Dubai, United Arab Emirates",
  locationId: "292223",
  locationLat: 25.2,
  locationLon: 55.3,
  locationCountryCode: "AE",
  event: "Fashion week",
  year: 2026,
  tags: ["fashion"],
  categories: ["photography"],
  peopleIds: ["p1"],
  people: ["Sara"],
  appearances: [],
  nft: null,
  isPublic: true,
  publishAt: null,
  secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
  publicId: "hm_visuals/media/a",
  resourceType: "image",
  embedUrl: null,
  posterUrl: null,
};

// The editor's state right after opening an item, built the way its hooks build it.
function editorFor(media: MediaItem) {
  const base = baseFieldsFrom(media);
  const nft = nftFieldsFrom(media);
  return {
    ...base,
    selectedTagSlugs: base.tagSlugs,
    selectedPeopleIds: base.peopleIds,
    selectedPeopleNames: base.peopleNames,
    nftPrice: nft.price,
    nftCurrency: nft.currency,
    nftEditionType: nft.editionType,
    nftEditionsTotal: nft.editionsTotal,
    nftEditionsRemaining: nft.editionsRemaining,
    nftOpenUntil: nft.openUntil,
    nftStatus: nft.status,
    nftMarketplaceUrl: nft.marketplaceUrl,
    appearances: appearancesFrom(media),
  };
}

describe("media editor change check", () => {
  it("sees no change in an item as just opened", () => {
    expect(editorValuesKey(editorValuesOf(editorFor(item)))).toBe(itemValuesKey(item));
  });

  it("sees a changed field, and no change once it is put back", () => {
    const editor = editorFor(item);
    expect(editorValuesKey(editorValuesOf({ ...editor, title: "Seed Photo 36b" }))).not.toBe(itemValuesKey(item));
    expect(editorValuesKey(editorValuesOf({ ...editor, selectedTagSlugs: [] }))).not.toBe(itemValuesKey(item));
    expect(editorValuesKey(editorValuesOf({ ...editor, title: "Seed Photo 36" }))).toBe(itemValuesKey(item));
  });

  it("sees a new file", () => {
    const editor = editorFor(item);
    const uploaded = { secureUrl: "https://res.cloudinary.com/demo/image/upload/v2/b.jpg", publicId: "b", resourceType: "image" };
    expect(editorValuesKey(editorValuesOf({ ...editor, uploaded }))).not.toBe(itemValuesKey(item));
  });
});
