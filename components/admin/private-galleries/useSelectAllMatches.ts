"use client";

import { useEffect, useMemo, useState } from "react";
import { errorMessage } from "@/hooks/useAdminAction";
import { useOnAdminDataChange } from "@/hooks/useAdminData";
import { fetchMatchingIds, filtersKey, type MediaFilters } from "@/app/admin/(protected)/media/lib/media-pages";
import { GALLERY_MAX_ITEMS } from "@/lib/admin-data";
import { addUpTo } from "./helpers";

export type BulkSelectHandlers = {
  onSelectMedia: (ids: string[]) => number;
  onDeselectMedia: (ids: string[]) => void;
};

type Options = {
  // Off in the page-image picker, which picks one photo and never selects all.
  enabled: boolean;
  filters: MediaFilters;
  selectedMediaIds: string[];
  handlers: BulkSelectHandlers;
  onError: (message: string) => void;
};

const LOOKUP_DELAY_MS = 250;

// "Select all" acts on everything the search and filters match, loaded or not (the whole
// library with no filter), up to a gallery's limit. It is ticked once nothing more can be added.
export function useSelectAllMatches({ enabled, filters, selectedMediaIds, handlers, onError }: Options) {
  const key = filtersKey(filters);
  const [found, setFound] = useState<{ key: string; ids: string[] } | null>(null);
  const [lookup, setLookup] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchMatchingIds(filters).then(
        (ids) => !cancelled && setFound({ key: filtersKey(filters), ids }),
        (e: unknown) => !cancelled && onError(errorMessage(e, "Failed to load media."))
      );
    }, LOOKUP_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, filters, lookup, onError]);

  useOnAdminDataChange(() => enabled && setLookup((value) => value + 1));

  const matches = found?.key === key ? found.ids : null;

  const state = useMemo(() => {
    if (!matches) return { checked: false, indeterminate: false };
    const selected = new Set(selectedMediaIds);
    const someSelected = matches.some((id) => selected.has(id));
    const checked = someSelected && addUpTo(selectedMediaIds, matches, GALLERY_MAX_ITEMS).count === 0;
    return { checked, indeterminate: someSelected && !checked };
  }, [matches, selectedMediaIds]);

  function toggle() {
    if (!matches) return;
    setNote(null);
    if (state.checked) return handlers.onDeselectMedia(matches);

    const added = handlers.onSelectMedia(matches);
    const selected = new Set(selectedMediaIds);
    const left = matches.filter((id) => !selected.has(id)).length - added;
    if (left > 0) {
      setNote(`${added} added. A gallery holds at most ${GALLERY_MAX_ITEMS} items, so ${left} more were left out.`);
    }
  }

  return {
    visible: enabled && (matches === null || matches.length > 0),
    ...state,
    note,
    clearNote: () => setNote(null),
    toggle,
  };
}
