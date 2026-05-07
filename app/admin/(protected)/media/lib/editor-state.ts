import { useMemo, useState } from "react";
import type { Appearance, MediaCategory, MediaItem, Uploaded } from "./types";
import { toList } from "./utils";

export function useMediaEditorState() {
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
  const [appearances, setAppearances] = useState<Appearance[]>([]);

  const tags = useMemo(() => toList(tagsText), [tagsText]);
  const people = useMemo(() => toList(peopleText), [peopleText]);

  function resetFields(keepBanner: boolean, clearBanner?: () => void) {
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
    setAppearances([]);
    if (!keepBanner && clearBanner) clearBanner();
  }

  function toggleCategory(key: MediaCategory) {
    setCategories((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  function addAppearance(kind: "featured" | "exhibited") {
    setAppearances((prev) => [
      ...prev,
      { kind, title: "", venue: "", city: "", country: "", dateFrom: "", dateTo: "", notes: "", link: "" },
    ]);
  }

  function updateAppearance(idx: number, patch: Partial<Appearance>) {
    setAppearances((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function removeAppearance(idx: number) {
    setAppearances((prev) => prev.filter((_, i) => i !== idx));
  }

  function loadIntoState(m: MediaItem) {
    setEditingId(m.id);

    if (m.type === "embed") {
      setMode("embed");
      setEmbedUrl(m.embedUrl ?? "");
      setUploaded(null);
    } else {
      setMode("upload");
      setEmbedUrl("");
      if (m.secureUrl && m.publicId && m.resourceType) {
        setUploaded({ secureUrl: m.secureUrl, publicId: m.publicId, resourceType: m.resourceType });
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
    setAppearances(Array.isArray(m.appearances) ? m.appearances : []);
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
    isPublic,
    setIsPublic,
    appearances,
    setAppearances,
    tags,
    people,
    resetFields,
    toggleCategory,
    addAppearance,
    updateAppearance,
    removeAppearance,
    loadIntoState,
  };
}