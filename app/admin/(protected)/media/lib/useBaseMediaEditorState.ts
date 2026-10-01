import { useMemo, useState } from "react";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import { baseFieldsFrom, type BaseFields } from "./editor-fields";
import type { MediaCategory, MediaItem, SavedPoster, Uploaded } from "./types";

export function useBaseMediaEditorState(initial: MediaItem | null) {
  const [start] = useState(() => baseFieldsFrom(initial));
  const [editingId, setEditingId] = useState<string>(start.editingId);

  const [mode, setMode] = useState<"upload" | "embed">(start.mode);
  const [uploaded, setUploaded] = useState<Uploaded | null>(start.uploaded);
  const [embedUrl, setEmbedUrl] = useState(start.embedUrl);
  const [savedPoster, setSavedPoster] = useState<SavedPoster | null>(start.savedPoster);

  const [title, setTitle] = useState(start.title);
  const [description, setDescription] = useState(start.description);
  const [location, setLocation] = useState(start.location);
  const [locationId, setLocationId] = useState<string | null>(start.locationId);
  const [locationLat, setLocationLat] = useState<number | null>(start.locationLat);
  const [locationLon, setLocationLon] = useState<number | null>(start.locationLon);
  const [locationCountryCode, setLocationCountryCode] = useState<string | null>(start.locationCountryCode);
  const [event, setEvent] = useState(start.event);
  const [year, setYear] = useState(start.year);
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(start.tagSlugs);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>(start.peopleIds);
  const [selectedPeopleNames, setSelectedPeopleNames] = useState<string[]>(start.peopleNames);
  const [categories, setCategories] = useState<MediaCategory[]>(start.categories);
  const [isPublic, setIsPublic] = useState(start.isPublic);
  const [privateGalleryTitles, setPrivateGalleryTitles] = useState<string[]>(start.privateGalleryTitles);

  const tags = useMemo(() => selectedTagSlugs.slice(0, 60), [selectedTagSlugs]);
  const peopleIds = useMemo(() => selectedPeopleIds.slice(0, 60), [selectedPeopleIds]);
  const people = useMemo(() => selectedPeopleNames.slice(0, 60), [selectedPeopleNames]);
  const primaryCategory = categories[0] ?? null;
  const isNft = primaryCategory === "nft" || categories.includes("nft");

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

  function toggleCategory(key: MediaCategory) {
    setCategories((prev) => {
      const has = prev.includes(key);
      if (has) return prev.filter((x) => x !== key);
      return [...prev, key];
    });
  }

  function setPrimaryCategory(key: MediaCategory) {
    setCategories((prev) => [key, ...prev.filter((x) => x !== key)]);
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

  function applyBaseFields(fields: BaseFields) {
    setEditingId(fields.editingId);
    setMode(fields.mode);
    setUploaded(fields.uploaded);
    setEmbedUrl(fields.embedUrl);
    setSavedPoster(fields.savedPoster);
    setTitle(fields.title);
    setDescription(fields.description);
    setLocation(fields.location);
    setLocationId(fields.locationId);
    setLocationLat(fields.locationLat);
    setLocationLon(fields.locationLon);
    setLocationCountryCode(fields.locationCountryCode);
    setEvent(fields.event);
    setYear(fields.year);
    setSelectedTagSlugs(fields.tagSlugs);
    setSelectedPeopleIds(fields.peopleIds);
    setSelectedPeopleNames(fields.peopleNames);
    setCategories(fields.categories);
    setIsPublic(fields.isPublic);
    setPrivateGalleryTitles(fields.privateGalleryTitles);
  }

  function resetBaseFields() {
    applyBaseFields(baseFieldsFrom(null));
  }

  function loadBaseIntoState(m: MediaItem) {
    applyBaseFields(baseFieldsFrom(m));
  }

  return {
    editingId,
    setEditingId,
    mode,
    setMode,
    uploaded,
    setUploaded,
    embedUrl,
    setEmbedUrl,
    savedPoster,
    title,
    setTitle,
    description,
    setDescription,
    location,
    setLocation,
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
    selectedTagSlugs,
    addTag,
    removeTag,
    selectedPeopleIds,
    selectedPeopleNames,
    setSelectedPeople,
    categories,
    setCategories,
    primaryCategory,
    setPrimaryCategory,
    toggleCategory,
    isNft,
    isPublic,
    setIsPublic,
    privateGalleryTitles,
    tags,
    peopleIds,
    people,
    resetBaseFields,
    loadBaseIntoState,
  };
}