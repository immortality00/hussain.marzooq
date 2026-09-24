"use client";

import { useMemo, useState } from "react";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { CloudinaryUploadedFile } from "@/components/shared/upload/CloudinaryMultiUploadButton";
import { cleanupUploadedAsset } from "@/lib/client/cleanup-uploaded-asset";
import { useMediaAppearancesState } from "../../lib/useMediaAppearancesState";
import type { MediaCategory } from "../../lib/types";

export type BatchFile = {
  kind: "file";
  id: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  originalFilename: string;
  title: string;
  description: string;
};

export type BatchLink = {
  kind: "link";
  id: string;
  embedUrl: string;
  watchUrl: string;
  preview: string | null;
  title: string;
  description: string;
};

export type BatchItem = BatchFile | BatchLink;

export type ResolvedVideoLink = {
  embedUrl: string;
  watchUrl: string;
  title: string | null;
  preview: string | null;
};

export function batchItemLabel(item: BatchItem) {
  return item.kind === "file" ? item.originalFilename : item.watchUrl;
}

function titleFromFilename(name: string): string {
  const withoutExt = name.replace(/\.[^./\\]+$/, "");
  return withoutExt.replace(/[._-]+/g, " ").trim().slice(0, 160);
}

export function useBatchMediaState() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [selectedPeopleNames, setSelectedPeopleNames] = useState<string[]>([]);

  const [location, setLocation] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLon, setLocationLon] = useState<number | null>(null);
  const [locationCountryCode, setLocationCountryCode] = useState<string | null>(null);
  const [event, setEvent] = useState("");
  const [year, setYear] = useState("");

  const appearanceState = useMediaAppearancesState();
  const [items, setItems] = useState<BatchItem[]>([]);

  const primaryCategory = categories[0] ?? null;
  const tags = useMemo(() => selectedTagSlugs.slice(0, 60), [selectedTagSlugs]);
  const peopleIds = useMemo(() => selectedPeopleIds.slice(0, 60), [selectedPeopleIds]);
  const people = useMemo(() => selectedPeopleNames.slice(0, 60), [selectedPeopleNames]);

  const selectedLocation = useMemo<LocationOption | null>(() => {
    if (!location || locationId === null || locationLat === null || locationLon === null) {
      return null;
    }
    return {
      id: locationId,
      label: location,
      lat: locationLat,
      lon: locationLon,
      countryCode: locationCountryCode,
      population: null,
      source: "dataset",
    };
  }, [location, locationId, locationLat, locationLon, locationCountryCode]);

  function setLocationFromOption(loc: LocationOption) {
    setLocation(loc.label);
    setLocationId(loc.id);
    setLocationLat(loc.lat);
    setLocationLon(loc.lon);
    setLocationCountryCode(loc.countryCode);
  }

  function clearLocation() {
    setLocation("");
    setLocationId(null);
    setLocationLat(null);
    setLocationLon(null);
    setLocationCountryCode(null);
  }

  function setPrimaryCategory(key: MediaCategory) {
    setCategories((prev) => [key, ...prev.filter((x) => x !== key)]);
  }

  function toggleCategory(key: MediaCategory) {
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  }

  function setSelectedPeople(next: { ids: string[]; names: string[] }) {
    setSelectedPeopleIds(next.ids.slice(0, 60));
    setSelectedPeopleNames(next.names.slice(0, 60));
  }

  function addTag(slug: string) {
    setSelectedTagSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug].slice(0, 60)));
  }

  function removeTag(slug: string) {
    setSelectedTagSlugs((prev) => prev.filter((s) => s !== slug));
  }

  function addFiles(uploaded: CloudinaryUploadedFile[]) {
    setItems((prev) => {
      const next = [...prev];
      for (const u of uploaded) {
        if (next.some((item) => item.id === u.publicId)) continue;
        next.push({
          kind: "file",
          id: u.publicId,
          secureUrl: u.secureUrl,
          publicId: u.publicId,
          resourceType: u.resourceType,
          originalFilename: u.originalFilename,
          title: titleFromFilename(u.originalFilename),
          description: "",
        });
      }
      return next;
    });
  }

  function addLinks(links: ResolvedVideoLink[]) {
    setItems((prev) => {
      const next = [...prev];
      for (const link of links) {
        if (next.some((item) => item.id === link.embedUrl)) continue;
        next.push({
          kind: "link",
          id: link.embedUrl,
          embedUrl: link.embedUrl,
          watchUrl: link.watchUrl,
          preview: link.preview,
          title: link.title ?? "",
          description: "",
        });
      }
      return next;
    });
  }

  function updateItem(id: string, patch: Partial<Pick<BatchItem, "title" | "description">>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function dropItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function removeItem(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (item?.kind === "file") cleanupUploadedAsset({ publicId: item.publicId });
    dropItem(id);
  }

  function resetAll() {
    setCategories([]);
    setIsPublic(true);
    setSelectedTagSlugs([]);
    setSelectedPeopleIds([]);
    setSelectedPeopleNames([]);
    clearLocation();
    setEvent("");
    setYear("");
    appearanceState.resetAppearances();
    setItems([]);
  }

  return {
    categories,
    primaryCategory,
    setPrimaryCategory,
    toggleCategory,
    isPublic,
    setIsPublic,

    selectedTagSlugs,
    tags,
    addTag,
    removeTag,

    selectedPeopleIds,
    selectedPeopleNames,
    peopleIds,
    people,
    setSelectedPeople,

    location,
    locationId,
    locationLat,
    locationLon,
    locationCountryCode,
    selectedLocation,
    setLocationFromOption,
    clearLocation,

    event,
    setEvent,
    year,
    setYear,

    ...appearanceState,

    items,
    addFiles,
    addLinks,
    updateItem,
    removeItem,
    dropItem,

    resetAll,
  };
}
