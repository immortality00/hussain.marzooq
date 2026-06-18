"use client";

import { useCallback, useState } from "react";

export function useAdminSearch(initialValue = "") {
  const [draftSearch, setDraftSearch] = useState(initialValue);
  const [activeSearch, setActiveSearch] = useState(initialValue.trim());

  const submitSearch = useCallback(
    (onSubmit?: (value: string) => void) => {
      const nextSearch = draftSearch.trim();
      setActiveSearch(nextSearch);
      onSubmit?.(nextSearch);
    },
    [draftSearch]
  );

  const clearSearch = useCallback((onClear?: () => void) => {
    setDraftSearch("");
    setActiveSearch("");
    onClear?.();
  }, []);

  return {
    draftSearch,
    activeSearch,
    hasActiveSearch: activeSearch.length > 0,
    setDraftSearch,
    submitSearch,
    clearSearch,
  };
}