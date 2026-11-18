import type { PublishSchedule } from "@/lib/media-schedule";
import { appearancesFrom, baseFieldsFrom, nftFieldsFrom, type NftFields } from "./editor-fields";
import type { Appearance, MediaItem, Uploaded } from "./types";

// Everything the media editor lets you change, as one comparable string. An item as loaded and the editor
// before any change give the same string, so a different one means unsaved changes — Previous / Next item and
// Back to list ask before leaving them.
export type EditorValues = {
  mode: "upload" | "embed";
  uploaded: Uploaded | null;
  embedUrl: string;
  title: string;
  description: string;
  location: string;
  locationId: string | null;
  event: string;
  year: string;
  tagSlugs: string[];
  peopleIds: string[];
  peopleNames: string[];
  categories: string[];
  isPublic: boolean;
  schedule: PublishSchedule;
  nft: NftFields;
  appearances: Appearance[];
};

// A fixed order, so two objects with the same values but keys made in another order still compare equal.
export function editorValuesKey(v: EditorValues): string {
  const { nft } = v;
  return JSON.stringify([
    v.mode,
    v.uploaded ? [v.uploaded.publicId, v.uploaded.secureUrl] : null,
    v.embedUrl,
    v.title,
    v.description,
    v.location,
    v.locationId,
    v.event,
    v.year,
    v.tagSlugs,
    v.peopleIds,
    v.peopleNames,
    v.categories,
    v.isPublic,
    [v.schedule.scheduled, v.schedule.local],
    [nft.price, nft.currency, nft.editionType, nft.editionsTotal, nft.editionsRemaining, nft.openUntil, nft.status, nft.marketplaceUrl],
    v.appearances,
  ]);
}

export function itemValuesKey(item: MediaItem): string {
  const base = baseFieldsFrom(item);
  return editorValuesKey({
    mode: base.mode,
    uploaded: base.uploaded,
    embedUrl: base.embedUrl,
    title: base.title,
    description: base.description,
    location: base.location,
    locationId: base.locationId,
    event: base.event,
    year: base.year,
    tagSlugs: base.tagSlugs,
    peopleIds: base.peopleIds,
    peopleNames: base.peopleNames,
    categories: base.categories,
    isPublic: base.isPublic,
    schedule: base.schedule,
    nft: nftFieldsFrom(item),
    appearances: appearancesFrom(item),
  });
}

type EditorState = Omit<EditorValues, "tagSlugs" | "peopleIds" | "peopleNames" | "nft"> & {
  selectedTagSlugs: string[];
  selectedPeopleIds: string[];
  selectedPeopleNames: string[];
  nftPrice: string;
  nftCurrency: NftFields["currency"];
  nftEditionType: NftFields["editionType"];
  nftEditionsTotal: string;
  nftEditionsRemaining: string;
  nftOpenUntil: string;
  nftStatus: NftFields["status"];
  nftMarketplaceUrl: string;
};

export function editorValuesOf(editor: EditorState): EditorValues {
  return {
    mode: editor.mode,
    uploaded: editor.uploaded,
    embedUrl: editor.embedUrl,
    title: editor.title,
    description: editor.description,
    location: editor.location,
    locationId: editor.locationId,
    event: editor.event,
    year: editor.year,
    tagSlugs: editor.selectedTagSlugs,
    peopleIds: editor.selectedPeopleIds,
    peopleNames: editor.selectedPeopleNames,
    categories: editor.categories,
    isPublic: editor.isPublic,
    schedule: editor.schedule,
    nft: {
      price: editor.nftPrice,
      currency: editor.nftCurrency,
      editionType: editor.nftEditionType,
      editionsTotal: editor.nftEditionsTotal,
      editionsRemaining: editor.nftEditionsRemaining,
      openUntil: editor.nftOpenUntil,
      status: editor.nftStatus,
      marketplaceUrl: editor.nftMarketplaceUrl,
    },
    appearances: editor.appearances,
  };
}
