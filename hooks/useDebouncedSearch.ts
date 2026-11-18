"use client";

import { useCallback, useEffect, useState } from "react";
import { useLatest } from "./useLatest";

// A search box's words: `text` is what the box shows, the query is what the search uses — it follows `text`
// 500 ms after the last keystroke, and every keystroke restarts the wait. Clear applies at once, and so does a
// starting value (a restored search).
export const SEARCH_DELAY_MS = 500;

// For a query kept elsewhere (a screen's address): the box hands its words to `onQuery` after the wait, and
// follows the query when it changes from outside.
export function useDebouncedText(query: string, onQuery: (query: string) => void) {
  const [text, setText] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const latestOnQuery = useLatest(onQuery);

  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== text) setText(query);
  }

  useEffect(() => {
    if (text === query) return;
    const timer = window.setTimeout(() => latestOnQuery.current(text), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text, query, latestOnQuery]);

  const clear = useCallback(() => {
    setText("");
    latestOnQuery.current("");
  }, [latestOnQuery]);

  return { text, setText, clear };
}

export function useDebouncedSearch(initial = "") {
  const [query, setQuery] = useState(initial);
  const { text, setText, clear } = useDebouncedText(query, setQuery);
  return { text, setText, query, clear };
}
