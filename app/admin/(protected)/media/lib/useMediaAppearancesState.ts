import { useState } from "react";
import { appearancesFrom } from "./editor-fields";
import type { Appearance, MediaItem } from "./types";

export function useMediaAppearancesState(initial: MediaItem | null) {
  const [appearances, setAppearances] = useState<Appearance[]>(() => appearancesFrom(initial));

  function addAppearance(kind: "featured" | "exhibited") {
    setAppearances((prev) => [
      ...prev,
      {
        kind,
        title: "",
        venue: "",
        city: "",
        country: "",
        locationId: null,
        lat: null,
        lon: null,
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
    setAppearances(appearancesFrom(m));
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