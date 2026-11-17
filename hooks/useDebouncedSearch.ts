"use client";

import { useCallback, useEffect, useState } from "react";

// A search box's words: `text` is what the box shows, `query` is what the search uses — it
// follows `text` 500 ms after the last keystroke, and every keystroke restarts the wait.
// Clear applies at once, and so does a starting value (a restored search).
export const SEARCH_DELAY_MS = 500;

export function useDebouncedSearch(initial = "") {
  const [text, setText] = useState(initial);
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    if (text === query) return;
    const timer = window.setTimeout(() => setQuery(text), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text, query]);

  const clear = useCallback(() => {
    setText("");
    setQuery("");
  }, []);

  return { text, setText, query, clear };
}
