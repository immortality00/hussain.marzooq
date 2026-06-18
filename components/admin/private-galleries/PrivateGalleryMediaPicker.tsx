"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { MediaItem } from "./types";

type MediaListResponse = {
  ok?: boolean;
  items?: MediaItem[];
  nextCursor?: string | null;
  error?: string;
};

type PrivateGalleryMediaPickerProps = {
  selectedMediaIds: string[];
  onToggleMedia: (id: string) => void;
};

const MEDIA_PAGE_LIMIT = 60;
const SELECTED_MEDIA_FETCH_LIMIT = 300;

function buildMediaQuery(params: { q?: string; cursor?: string | null; ids?: string[] }) {
  const searchParams = new URLSearchParams();

  if (params.ids?.length) {
    searchParams.set("ids", params.ids.join(","));
    searchParams.set("limit", String(SELECTED_MEDIA_FETCH_LIMIT));
    return `/api/media/admin-list?${searchParams.toString()}`;
  }

  searchParams.set("limit", String(MEDIA_PAGE_LIMIT));

  const q = params.q?.trim();
  if (q) searchParams.set("q", q);
  if (params.cursor) searchParams.set("cursor", params.cursor);

  return `/api/media/admin-list?${searchParams.toString()}`;
}

function mergeMediaItems(current: MediaItem[], next: MediaItem[]) {
  const map = new Map<string, MediaItem>();

  for (const item of current) map.set(item.id, item);
  for (const item of next) map.set(item.id, item);

  return Array.from(map.values());
}

function mediaMetaText(item: MediaItem) {
  return [item.location, item.event, item.tags.join(", "), item.people.join(", ")]
    .filter(Boolean)
    .join(" • ");
}

function MediaCard({
  item,
  selected,
  onToggle,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={`overflow-hidden rounded-[1.5rem] border text-left transition-colors ${
        selected ? "border-foreground bg-accent/30" : "hover:bg-accent/20"
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {item.secureUrl ? (
          item.type === "video" ? (
            <video className="h-full w-full object-cover" src={item.secureUrl} muted playsInline />
          ) : (
            <Image src={item.secureUrl} alt={item.title} fill className="object-cover" sizes="240px" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No preview
          </div>
        )}

        {selected ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-sm">
            Selected
          </span>
        ) : null}
      </div>

      <div className="space-y-1 p-3">
        <div className="line-clamp-1 text-sm font-medium">{item.title}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">{mediaMetaText(item)}</div>
      </div>
    </button>
  );
}

export function PrivateGalleryMediaPicker({
  selectedMediaIds,
  onToggleMedia,
}: PrivateGalleryMediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [draftSearch, setDraftSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const selectedIdSet = useMemo(() => new Set(selectedMediaIds), [selectedMediaIds]);

  const selectedMedia = useMemo(() => {
    const byId = new Map<string, MediaItem>();
    for (const item of selectedItems) byId.set(item.id, item);
    for (const item of items) byId.set(item.id, item);

    return selectedMediaIds
      .map((id) => byId.get(id))
      .filter((item): item is MediaItem => Boolean(item));
  }, [items, selectedItems, selectedMediaIds]);

  const selectedMediaListItems = useMemo(() => {
    const currentPageIds = new Set(items.map((item) => item.id));
    return selectedMedia.filter((item) => !currentPageIds.has(item.id));
  }, [items, selectedMedia]);

  const loadMedia = useCallback(
    async ({ q, cursor, append }: { q: string; cursor?: string | null; append: boolean }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildMediaQuery({ q, cursor }), { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as MediaListResponse | null;

        if (requestId !== requestIdRef.current) return;

        if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
          setError(data?.error ?? "Failed to load media.");
          return;
        }

        setItems((prev) => (append ? mergeMediaItems(prev, data.items ?? []) : data.items ?? []));
        setNextCursor(data.nextCursor ?? null);
      } catch {
        if (requestId === requestIdRef.current) setError("Failed to load media.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadMedia({ q: "", append: false });
  }, [loadMedia]);

  useEffect(() => {
    const missingIds = selectedMediaIds.filter(
      (id) =>
        !selectedItems.some((item) => item.id === id) && !items.some((item) => item.id === id)
    );

    if (missingIds.length === 0) return;

    let cancelled = false;

    async function loadSelectedMedia() {
      try {
        const res = await fetch(buildMediaQuery({ ids: missingIds }), { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as MediaListResponse | null;

        if (cancelled || !res.ok || !data?.ok || !Array.isArray(data.items)) return;
        setSelectedItems((prev) => mergeMediaItems(prev, data.items ?? []));
      } catch {
        // The save API still validates selected ids. This fetch only hydrates selected previews.
      }
    }

    void loadSelectedMedia();

    return () => {
      cancelled = true;
    };
  }, [items, selectedItems, selectedMediaIds]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = draftSearch.trim();
    setActiveSearch(q);
    void loadMedia({ q, append: false });
  }

  function clearSearch() {
    setDraftSearch("");
    setActiveSearch("");
    void loadMedia({ q: "", append: false });
  }

  return (
    <section className="rounded-[2rem] border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Select media</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {selectedMediaIds.length} selected. Search loads from the full media library, not only the first page.
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex w-full flex-wrap gap-2 md:w-auto">
          <input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search title, tags, location, people, event..."
            className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:w-80"
          />
          <button type="submit" className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">
            Search
          </button>
          {activeSearch ? (
            <button type="button" onClick={clearSearch} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">
              Clear
            </button>
          ) : null}
        </form>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {selectedMediaListItems.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Selected media outside current results
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedMediaListItems.map((item) => (
              <MediaCard key={item.id} item={item} selected onToggle={onToggleMedia} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading media…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
            No media found.
          </div>
        ) : (
          items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selectedIdSet.has(item.id)}
              onToggle={onToggleMedia}
            />
          ))
        )}
      </div>

      {nextCursor ? (
        <button
          type="button"
          onClick={() => void loadMedia({ q: activeSearch, cursor: nextCursor, append: true })}
          disabled={loadingMore}
          className="mt-5 rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more media"}
        </button>
      ) : null}
    </section>
  );
}