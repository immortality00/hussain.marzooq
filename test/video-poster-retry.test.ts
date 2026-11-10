import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";
import { memory, memoryDb, resetMemoryDb } from "@/test/support/memory-db";

const store = vi.fn();
vi.mock("@/lib/server/video-posters", () => ({
  storeVideoPoster: (...args: unknown[]) => store(...args),
  discardUnsavedPoster: vi.fn(async () => {}),
}));
vi.mock("@/lib/server/cloudinary-warm", () => ({ warmImageSizes: vi.fn(async () => ({ requested: 0, failed: [] })) }));

const { retryMissingPosters } = await import("@/lib/server/video-poster-retry");

const NOW = new Date("2026-11-10T12:00:00Z");
const embed = (id: string, extra: Record<string, unknown> = {}) => ({
  _id: id,
  type: "embed",
  isPublic: true,
  embedUrl: "https://www.youtube-nocookie.com/embed/abcdefghijk",
  ...extra,
});

describe("retryMissingPosters", () => {
  beforeEach(() => {
    store.mockReset();
    resetMemoryDb({
      media: [
        embed("a"),
        embed("b", { posterUrl: "https://res.cloudinary.com/demo/image/upload/p.jpg" }),
        embed("c", { posterTriedAt: new Date(NOW.getTime() - 25 * 60_000) }),
        embed("d", { isPublic: false }),
        { _id: "e", type: "image", isPublic: true },
      ],
    });
  });

  it("stores a poster for a video link that has none, and only that one", async () => {
    store.mockResolvedValue({ url: "https://res.cloudinary.com/demo/image/upload/new.jpg", publicId: "posters/x" });
    const stored = await retryMissingPosters(memoryDb as unknown as Db, NOW);
    expect(stored).toBe(1);
    expect(store).toHaveBeenCalledTimes(1);
    const a = memory.collections.media.find((d) => d._id === "a")!;
    expect(a.posterUrl).toBe("https://res.cloudinary.com/demo/image/upload/new.jpg");
    expect(a.posterPublicId).toBe("posters/x");
    expect(a.posterTriedAt).toBeUndefined();
  });

  it("records the try when YouTube has no thumbnail yet, and waits 30 minutes", async () => {
    store.mockResolvedValue(null);
    expect(await retryMissingPosters(memoryDb as unknown as Db, NOW)).toBe(0);
    const a = memory.collections.media.find((d) => d._id === "a")!;
    expect(a.posterTriedAt).toEqual(NOW);
    store.mockClear();
    await retryMissingPosters(memoryDb as unknown as Db, new Date(NOW.getTime() + 10 * 60_000));
    expect(store).toHaveBeenCalledTimes(1); // only "c", whose last try is now over 30 minutes old
  });
});
