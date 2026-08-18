import { useMemo, useState } from "react";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { MediaCategory, MediaItem, Uploaded } from "./types";

export function useBaseMediaEditorState() {
  const [editingId, setEditingId] = useState<string>("");

  const [mode, setMode] = useState<"upload" | "embed">("upload");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLon, setLocationLon] = useState<number | null>(null);
  const [locationCountryCode, setLocationCountryCode] = useState<string | null>(null);
  const [event, setEvent] = useState("");
  const [year, setYear] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [selectedPeopleNames, setSelectedPeopleNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isPublic, setIsPublic] = useState(true);

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

  function resetBaseFields() {
    setEditingId("");
    setMode("upload");
    setUploaded(null);
    setEmbedUrl("");
    setTitle("");
    setDescription("");
    clearLocation();
    setEvent("");
    setYear("");
    setSelectedTagSlugs([]);
    setSelectedPeopleIds([]);
    setSelectedPeopleNames([]);
    setCategories([]);
    setIsPublic(true);
  }

  function loadBaseIntoState(m: MediaItem) {
    setEditingId(m.id);

    if (m.type === "embed") {
      setMode("embed");
      setEmbedUrl(m.embedUrl ?? "");
      setUploaded(null);
    } else {
      setMode("upload");
      setEmbedUrl("");
      if (m.secureUrl && m.publicId && m.resourceType) {
        setUploaded({
          secureUrl: m.secureUrl,
          publicId: m.publicId,
          resourceType: m.resourceType,
        });
      } else {
        setUploaded(null);
      }
    }

    setTitle(m.title ?? "");
    setDescription(m.description ?? "");
    setLocation(m.location ?? "");
    setLocationId(m.locationId ?? null);
    setLocationLat(typeof m.locationLat === "number" ? m.locationLat : null);
    setLocationLon(typeof m.locationLon === "number" ? m.locationLon : null);
    setLocationCountryCode(m.locationCountryCode ?? null);
    setEvent(m.event ?? "");
    setYear(m.year ? String(m.year) : "");
    setSelectedTagSlugs(m.tags ?? []);
    setSelectedPeopleIds(m.peopleIds ?? []);
    setSelectedPeopleNames(m.people ?? []);
    setCategories((m.categories ?? []) as MediaCategory[]);
    setIsPublic(Boolean(m.isPublic));
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
    tags,
    peopleIds,
    people,
    resetBaseFields,
    loadBaseIntoState,
  };
}