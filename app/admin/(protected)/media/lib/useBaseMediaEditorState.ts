import { useMemo, useState } from "react";
import type { MediaCategory, MediaItem, Uploaded } from "./types";
import { toList } from "./utils";

export function useBaseMediaEditorState() {
  const [editingId, setEditingId] = useState<string>("");

  const [mode, setMode] = useState<"upload" | "embed">("upload");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [event, setEvent] = useState("");
  const [year, setYear] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [peopleText, setPeopleText] = useState("");
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const tags = useMemo(() => toList(tagsText), [tagsText]);
  const people = useMemo(() => toList(peopleText), [peopleText]);
  const primaryCategory = categories[0] ?? null;
  const isNft = primaryCategory === "nft" || categories.includes("nft");

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

  function resetBaseFields() {
    setEditingId("");
    setMode("upload");
    setUploaded(null);
    setEmbedUrl("");
    setTitle("");
    setDescription("");
    setLocation("");
    setEvent("");
    setYear("");
    setTagsText("");
    setPeopleText("");
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
    setEvent(m.event ?? "");
    setYear(m.year ? String(m.year) : "");
    setTagsText((m.tags ?? []).join(", "));
    setPeopleText((m.people ?? []).join(", "));
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
    event,
    setEvent,
    year,
    setYear,
    tagsText,
    setTagsText,
    peopleText,
    setPeopleText,
    categories,
    setCategories,
    primaryCategory,
    setPrimaryCategory,
    toggleCategory,
    isNft,
    isPublic,
    setIsPublic,
    tags,
    people,
    resetBaseFields,
    loadBaseIntoState,
  };
}