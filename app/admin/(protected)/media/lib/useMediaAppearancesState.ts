import { useState } from "react";
import type { Appearance, MediaItem } from "./types";

export function useMediaAppearancesState() {
  const [appearances, setAppearances] = useState<Appearance[]>([]);

  function addAppearance(kind: "featured" | "exhibited") {
    setAppearances((prev) => [
      ...prev,
      {
        kind,
        title: "",
        venue: "",
        city: "",
        country: "",
        dateFrom: "",
        dateTo: "",
        notes: "",
        link: "",
      },
    ]);
  }

  function updateAppearance(idx: number, patch: Partial<Appearance>) {
    setAppearances((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function removeAppearance(idx: number) {
    setAppearances((prev) => prev.filter((_, i) => i !== idx));
  }

  function resetAppearances() {
    setAppearances([]);
  }

  function loadAppearancesIntoState(m: MediaItem) {
    setAppearances(Array.isArray(m.appearances) ? m.appearances : []);
  }

  return {
    appearances,
    setAppearances,
    addAppearance,
    updateAppearance,
    removeAppearance,
    resetAppearances,
    loadAppearancesIntoState,
  };
}