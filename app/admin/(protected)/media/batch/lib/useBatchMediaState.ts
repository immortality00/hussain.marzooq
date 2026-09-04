"use client";

import { useMemo, useState } from "react";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { CloudinaryUploadedFile } from "@/components/admin/CloudinaryMultiUploadButton";
import { useMediaAppearancesState } from "../../lib/useMediaAppearancesState";
import type { MediaCategory } from "../../lib/types";

export type BatchFile = {
  id: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  originalFilename: string;
  title: string;
  description: string;
};

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
  const [files, setFiles] = useState<BatchFile[]>([]);

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
    setFiles((prev) => {
      const next = [...prev];
      for (const u of uploaded) {
        if (next.some((f) => f.publicId === u.publicId)) continue;
        next.push({
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

  function updateFile(id: string, patch: Partial<Pick<BatchFile, "title" | "description">>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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
    setFiles([]);
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

    files,
    addFiles,
    updateFile,
    removeFile,

    resetAll,
  };
}
