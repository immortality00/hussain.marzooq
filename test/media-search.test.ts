// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PUBLIC_MEDIA_PAGE_SIZE } from "@/lib/media-cursor";
import type { MediaItem } from "@/components/media/types";
import { useMediaSearch } from "@/components/media/useMediaSearch";

const BASE_TIME = Date.parse("2026-09-01T12:00:00.000Z");

function item(index: number): MediaItem {
  return {
    id: String(index + 1).padStart(24, "0"),
    type: "image",
    title: `Photo ${index + 1}`,
    description: null,
    location: null,
    event: null,
    year: null,
    tags: [],
    categories: ["photography"],
    people: [],
    appearances: [],
    secureUrl: `https://res.cloudinary.com/demo/image/upload/photo-${index + 1}.jpg`,
    publicId: `photo-${index + 1}`,
    embedUrl: null,
    posterUrl: null,
    createdAt: new Date(BASE_TIME - index * 1000).toISOString(),
  } as MediaItem;
}

function page(start: number, count: number) {
  return Array.from({ length: count }, (_, offset) => item(start + offset));
}

function respond(items: MediaItem[], nextCursor: string | null) {
  return new Response(JSON.stringify({ items, nextCursor }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function lastRequestUrl(fetchMock: ReturnType<typeof vi.fn>) {
  const calls = fetchMock.mock.calls;
  return new URL(String(calls[calls.length - 1][0]), "https://hm.test");
}

// Stable references: the hook resets its pool whenever the `items` prop changes
// identity, so a fresh array per render would re-fire that effect forever.
const SEED_30 = page(0, 30);
const SEED_5 = page(0, 5);
const SEED_PAGE_SIZE = page(0, PUBLIC_MEDIA_PAGE_SIZE);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useMediaSearch — browse-mode pagination (L6 regression)", () => {
  test("offers Load more while browsing, with no search active", () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_PAGE_SIZE, searchCategory: "photography" })
    );

    expect(result.current.hasActiveSearch).toBe(false);
    expect(result.current.canLoadMore).toBe(true);
  });

  test("reaches item 61 by loading twice while browsing", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(respond(page(30, 30), "cursor-2"));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(60);

    fetchMock.mockResolvedValueOnce(respond(page(60, 30), "cursor-3"));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(90);
    expect(result.current.displayedItems[60].title).toBe("Photo 61");
    expect(result.current.canLoadMore).toBe(true);
  });

  test("builds each browse cursor from the last loaded item, not from the server cursor", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(respond(page(30, 30), "server-cursor"));
    await act(async () => {
      await result.current.loadMore();
    });

    const firstCursor = lastRequestUrl(fetchMock).searchParams.get("cursor") as string;
    expect(JSON.parse(Buffer.from(firstCursor, "base64url").toString("utf8"))).toEqual({
      createdAt: item(29).createdAt,
      id: item(29).id,
    });

    fetchMock.mockResolvedValueOnce(respond(page(60, 30), "server-cursor"));
    await act(async () => {
      await result.current.loadMore();
    });

    const secondCursor = lastRequestUrl(fetchMock).searchParams.get("cursor") as string;
    expect(JSON.parse(Buffer.from(secondCursor, "base64url").toString("utf8"))).toEqual({
      createdAt: item(59).createdAt,
      id: item(59).id,
    });
  });

  test("stops offering Load more when the server reports no next page", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(respond(page(30, 12), null));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(42);
    expect(result.current.canLoadMore).toBe(false);
  });

  test("does not offer Load more when the first page is short", () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_5, searchCategory: "photography" })
    );

    expect(result.current.canLoadMore).toBe(false);
  });

  test("never paginates when no search category is wired up", async () => {
    const { result } = renderHook(() => useMediaSearch({ items: SEED_30 }));

    expect(result.current.hasDbSearch).toBe(false);
    expect(result.current.canLoadMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("drops duplicates when a page overlaps the one already loaded", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(respond(page(25, 30), "cursor-2"));
    await act(async () => {
      await result.current.loadMore();
    });

    const ids = result.current.displayedItems.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(55);
  });

  test("surfaces a load-more failure without dropping what is already shown", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Could not load more media." }), { status: 500 })
    );
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.searchError).toBe("Could not load more media.");
    expect(result.current.displayedItems).toHaveLength(30);
  });
});

describe("useMediaSearch — search mode", () => {
  test("paginates a search on the server cursor and scopes to a locked tag", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({
        items: SEED_30,
        searchCategory: "photography",
        lockedTag: "exhibitions",
      })
    );

    fetchMock.mockResolvedValueOnce(respond(page(0, 60), "search-cursor"));
    act(() => {
      result.current.setQ("eyes");
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.displayedItems).toHaveLength(60));

    const searchUrl = lastRequestUrl(fetchMock);
    expect(searchUrl.searchParams.get("q")).toBe("eyes");
    expect(searchUrl.searchParams.get("tag")).toBe("exhibitions");
    expect(result.current.canLoadMore).toBe(true);

    fetchMock.mockResolvedValueOnce(respond(page(60, 15), null));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(lastRequestUrl(fetchMock).searchParams.get("cursor")).toBe("search-cursor");
    expect(result.current.displayedItems).toHaveLength(75);
    expect(result.current.canLoadMore).toBe(false);
  });

  test("returns to the seeded browse pool when the query is cleared", async () => {
    const { result } = renderHook(() =>
      useMediaSearch({ items: SEED_30, searchCategory: "photography" })
    );

    fetchMock.mockResolvedValueOnce(respond(page(90, 2), null));
    act(() => {
      result.current.setQ("eyes");
    });
    await waitFor(() => expect(result.current.displayedItems).toHaveLength(2));

    act(() => {
      result.current.setQ("");
    });

    await waitFor(() => expect(result.current.displayedItems).toHaveLength(30));
    expect(result.current.canLoadMore).toBe(true);
  });
});
