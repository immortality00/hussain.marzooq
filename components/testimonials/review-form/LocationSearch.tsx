"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationOption } from "./types";
import { isLocationOption } from "./utils";

export function LocationSearch({
  selectedLocation,
  onSelect,
  onClear,
}: {
  selectedLocation: LocationOption | null;
  onSelect: (location: LocationOption) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(selectedLocation?.label ?? "");
  const [items, setItems] = useState<LocationOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedLocation) setQuery(selectedLocation.label);
  }, [selectedLocation]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmedQuery = query.trim();

    if (selectedLocation && trimmedQuery === selectedLocation.label) {
      setItems([]);
      setIsOpen(false);
      setMessage(null);
      setIsSearching(false);
      return;
    }

    if (trimmedQuery.length < 2) {
      setItems([]);
      setIsOpen(false);
      setMessage(null);
      setIsSearching(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      setMessage(null);

      try {
        const res = await fetch(
          `/api/testimonials/location-search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          items?: unknown[];
          error?: string;
        } | null;

        if (!res.ok || !data?.ok) {
          setItems([]);
          setIsOpen(false);
          setMessage(data?.error ?? "Location search failed.");
          return;
        }

        const nextItems = Array.isArray(data.items)
          ? data.items.filter(isLocationOption).slice(0, 8)
          : [];

        setItems(nextItems);
        setIsOpen(nextItems.length > 0);
        setMessage(nextItems.length === 0 ? "No matching locations found." : null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setItems([]);
        setIsOpen(false);
        setMessage("Location search failed.");
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query, selectedLocation]);

  function chooseLocation(location: LocationOption) {
    onSelect(location);
    setQuery(location.label);
    setItems([]);
    setIsOpen(false);
    setMessage(null);
  }

  function clearLocation() {
    onClear();
    setQuery("");
    setItems([]);
    setIsOpen(false);
    setMessage(null);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Location</label>

      <div className="relative">
        <input
          value={query}
          onChange={(event) => {
            if (selectedLocation) onClear();
            setQuery(event.target.value);
          }}
          onFocus={() => {
            if (items.length > 0) setIsOpen(true);
          }}
          className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 pr-24 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type city or country..."
          autoComplete="off"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isSearching ? (
            <span className="px-2 text-xs text-muted-foreground">Searching</span>
          ) : null}

          {selectedLocation ? (
            <button
              type="button"
              onClick={clearLocation}
              className="rounded-lg border border-border/70 bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>

        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-64 overflow-y-auto rounded-xl border border-border/70 bg-background p-1 shadow-xl">
            {items.map((item) => (
              <button
                key={`${item.source}-${item.id}`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseLocation(item)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="block font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.countryCode ? item.countryCode : "Location"}
                  {typeof item.population === "number" && item.population > 0
                    ? ` • population ${item.population.toLocaleString()}`
                    : ""}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {message ? <p className="text-xs leading-5 text-muted-foreground">{message}</p> : null}
    </div>
  );
}