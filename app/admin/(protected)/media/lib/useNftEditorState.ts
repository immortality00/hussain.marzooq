import { useState } from "react";
import { nftFieldsFrom, type NftFields } from "./editor-fields";
import type { CryptoCurrency, MediaItem, NftEditionType, NftStatus } from "./types";

export function useNftEditorState(initial: MediaItem | null) {
  const [start] = useState(() => nftFieldsFrom(initial));
  const [nftPrice, setNftPrice] = useState(start.price);
  const [nftCurrency, setNftCurrency] = useState<CryptoCurrency>(start.currency);
  const [nftEditionType, setNftEditionTypeState] = useState<NftEditionType>(start.editionType);
  const [nftEditionsTotal, setNftEditionsTotalState] = useState(start.editionsTotal);
  const [nftEditionsRemaining, setNftEditionsRemainingState] = useState(start.editionsRemaining);
  const [nftOpenUntil, setNftOpenUntil] = useState(start.openUntil);
  const [nftStatus, setNftStatusState] = useState<NftStatus>(start.status);
  const [nftMarketplaceUrl, setNftMarketplaceUrl] = useState(start.marketplaceUrl);

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

  function applyNftFields(fields: NftFields) {
    setNftPrice(fields.price);
    setNftCurrency(fields.currency);
    setNftEditionTypeState(fields.editionType);
    setNftEditionsTotalState(fields.editionsTotal);
    setNftEditionsRemainingState(fields.editionsRemaining);
    setNftOpenUntil(fields.openUntil);
    setNftStatusState(fields.status);
    setNftMarketplaceUrl(fields.marketplaceUrl);
  }

  function resetNftFields() {
    applyNftFields(nftFieldsFrom(null));
  }

  function loadNftIntoState(m: MediaItem) {
    applyNftFields(nftFieldsFrom(m));
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