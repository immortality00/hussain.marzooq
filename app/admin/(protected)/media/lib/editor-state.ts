import { useMemo, useState } from "react";
import type {
  Appearance,
  CryptoCurrency,
  MediaCategory,
  MediaItem,
  NftEditionType,
  NftStatus,
  Uploaded,
} from "./types";
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

  const [nftPrice, setNftPrice] = useState("");
  const [nftCurrency, setNftCurrency] = useState<CryptoCurrency>("ETH");
  const [nftEditionType, setNftEditionTypeState] = useState<NftEditionType>("1/1");
  const [nftEditionsTotal, setNftEditionsTotalState] = useState("1");
  const [nftEditionsRemaining, setNftEditionsRemainingState] = useState("1");
  const [nftOpenUntil, setNftOpenUntil] = useState("");
  const [nftStatus, setNftStatusState] = useState<NftStatus>("available");
  const [nftMarketplaceUrl, setNftMarketplaceUrl] = useState("");

  const tags = useMemo(() => toList(tagsText), [tagsText]);
  const people = useMemo(() => toList(peopleText), [peopleText]);
  const primaryCategory = categories[0] ?? null;
  const isNft = primaryCategory === "nft" || categories.includes("nft");

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
    setNftPrice("");
    setNftCurrency("ETH");
    setNftEditionTypeState("1/1");
    setNftEditionsTotalState("1");
    setNftEditionsRemainingState("1");
    setNftOpenUntil("");
    setNftStatusState("available");
    setNftMarketplaceUrl("");
    if (!keepBanner && clearBanner) clearBanner();
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
    if (key === "nft") {
      setMode("upload");
      setEmbedUrl("");
      setNftEditionType("1/1");
      setNftStatus("available");
    }
  }

  function setNftEditionType(value: NftEditionType) {
    setNftEditionTypeState(value);

    if (value === "1/1") {
      setNftEditionsTotalState("1");
      setNftEditionsRemainingState(nftStatus === "sold" ? "0" : "1");
      setNftOpenUntil("");
      return;
    }

    if (value === "limited") {
      if (!nftEditionsTotal || nftEditionsTotal === "1") setNftEditionsTotalState("50");
      if (nftStatus === "sold") setNftEditionsRemainingState("0");
      else if (!nftEditionsRemaining || nftEditionsRemaining === "1") setNftEditionsRemainingState("50");
      setNftOpenUntil("");
      return;
    }

    setNftEditionsTotalState("");
    setNftEditionsRemainingState("");
  }

  function setNftStatus(value: NftStatus) {
    setNftStatusState(value);

    if (value === "sold") {
      if (nftEditionType !== "open") {
        setNftEditionsRemainingState("0");
      }
      return;
    }

    if (nftEditionType === "1/1") {
      setNftEditionsRemainingState("1");
    }
  }

  function setNftEditionsTotal(value: string) {
    const cleaned = value.replace(/[^\d]/g, "");

    if (nftEditionType === "1/1") {
      setNftEditionsTotalState("1");
      return;
    }

    if (nftEditionType === "open") {
      setNftEditionsTotalState("");
      return;
    }

    setNftEditionsTotalState(cleaned);

    const total = cleaned === "" ? null : Number(cleaned);
    const remaining = nftEditionsRemaining === "" ? null : Number(nftEditionsRemaining);
    if (total !== null && remaining !== null && remaining > total) {
      setNftEditionsRemainingState(cleaned);
    }
  }

  function setNftEditionsRemaining(value: string) {
    if (nftEditionType === "open") {
      setNftEditionsRemainingState("");
      return;
    }

    if (nftStatus === "sold") {
      setNftEditionsRemainingState("0");
      return;
    }

    if (nftEditionType === "1/1") {
      setNftEditionsRemainingState("1");
      return;
    }

    const cleaned = value.replace(/[^\d]/g, "");
    const total = nftEditionsTotal === "" ? null : Number(nftEditionsTotal);
    const next = cleaned === "" ? "" : String(Number(cleaned));

    if (total !== null && next !== "" && Number(next) > total) {
      setNftEditionsRemainingState(String(total));
      return;
    }

    setNftEditionsRemainingState(next);
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

    setNftPrice(m.nft?.price === null || m.nft?.price === undefined ? "" : String(m.nft.price));
    setNftCurrency(m.nft?.currency ?? "ETH");
    setNftEditionTypeState(m.nft?.editionType ?? "1/1");
    setNftEditionsTotalState(
      m.nft?.editionsTotal === null || m.nft?.editionsTotal === undefined ? "" : String(m.nft.editionsTotal)
    );
    setNftEditionsRemainingState(
      m.nft?.editionsRemaining === null || m.nft?.editionsRemaining === undefined ? "" : String(m.nft.editionsRemaining)
    );
    setNftOpenUntil(m.nft?.openUntil ? m.nft.openUntil.slice(0, 16) : "");
    setNftStatusState(m.nft?.status ?? "available");
    setNftMarketplaceUrl(m.nft?.marketplaceUrl ?? "");
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
    isNft,
    isPublic,
    setIsPublic,
    appearances,
    setAppearances,
    nftPrice,
    setNftPrice,
    nftCurrency,
    setNftCurrency,
    nftEditionType,
    setNftEditionType,
    nftEditionsTotal,
    setNftEditionsTotal,
    nftEditionsRemaining,
    setNftEditionsRemaining,
    nftOpenUntil,
    setNftOpenUntil,
    nftStatus,
    setNftStatus,
    nftMarketplaceUrl,
    setNftMarketplaceUrl,
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