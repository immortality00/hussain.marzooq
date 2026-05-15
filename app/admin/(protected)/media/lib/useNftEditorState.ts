import { useState } from "react";
import type { CryptoCurrency, MediaItem, NftEditionType, NftStatus } from "./types";

export function useNftEditorState() {
  const [nftPrice, setNftPrice] = useState("");
  const [nftCurrency, setNftCurrency] = useState<CryptoCurrency>("ETH");
  const [nftEditionType, setNftEditionTypeState] = useState<NftEditionType>("1/1");
  const [nftEditionsTotal, setNftEditionsTotalState] = useState("1");
  const [nftEditionsRemaining, setNftEditionsRemainingState] = useState("1");
  const [nftOpenUntil, setNftOpenUntil] = useState("");
  const [nftStatus, setNftStatusState] = useState<NftStatus>("available");
  const [nftMarketplaceUrl, setNftMarketplaceUrl] = useState("");

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

  function resetNftFields() {
    setNftPrice("");
    setNftCurrency("ETH");
    setNftEditionTypeState("1/1");
    setNftEditionsTotalState("1");
    setNftEditionsRemainingState("1");
    setNftOpenUntil("");
    setNftStatusState("available");
    setNftMarketplaceUrl("");
  }

  function loadNftIntoState(m: MediaItem) {
    setNftPrice(m.nft?.price === null || m.nft?.price === undefined ? "" : String(m.nft.price));
    setNftCurrency(m.nft?.currency ?? "ETH");
    setNftEditionTypeState(m.nft?.editionType ?? "1/1");
    setNftEditionsTotalState(
      m.nft?.editionsTotal === null || m.nft?.editionsTotal === undefined
        ? ""
        : String(m.nft.editionsTotal)
    );
    setNftEditionsRemainingState(
      m.nft?.editionsRemaining === null || m.nft?.editionsRemaining === undefined
        ? ""
        : String(m.nft.editionsRemaining)
    );
    setNftOpenUntil(m.nft?.openUntil ? m.nft.openUntil.slice(0, 16) : "");
    setNftStatusState(m.nft?.status ?? "available");
    setNftMarketplaceUrl(m.nft?.marketplaceUrl ?? "");
  }

  return {
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
    resetNftFields,
    loadNftIntoState,
  };
}