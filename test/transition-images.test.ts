import { beforeEach, describe, expect, it, vi } from "vitest";

const cache = vi.hoisted(() => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));
const db = vi.hoisted(() => ({ pipeline: [] as unknown[], docs: [] as Record<string, unknown>[] }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: cache.revalidateTag,
  revalidatePath: cache.revalidatePath,
}));
vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: () => ({
      aggregate: (pipeline: unknown[]) => {
        db.pipeline = pipeline;
        return { toArray: async () => db.docs };
      },
    }),
  }),
}));

import { getTransitionImages } from "@/lib/server/public-media";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";
import { revalidateMediaSurfaces } from "@/app/api/_lib/revalidate";
import { TRANSITION_IMAGES_TAG, TRANSITION_POOL_SIZE } from "@/lib/transition-images";
import { fromRoot, readSource, relativePath, sourceFiles } from "@/test/support/source-files";

beforeEach(() => {
  cache.revalidateTag.mockClear();
  cache.revalidatePath.mockClear();
  db.pipeline = [];
  db.docs = [];
});

describe("the transition's photos", () => {
  it("are a random pick of the public photos, not the newest", async () => {
    db.docs = [
      { type: "image", secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/a.jpg" },
      { type: "image", secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/b.jpg" },
    ];

    vi.useFakeTimers({ now: new Date("2026-10-25T12:00:00Z"), toFake: ["Date"] });
    const urls = await getTransitionImages();
    const publicPhotos = buildPublicMediaQuery({ type: "image" });
    vi.useRealTimers();

    const [match, sample] = db.pipeline as Record<string, Record<string, unknown>>[];
    expect(match).toEqual({ $match: publicPhotos });
    expect(sample).toEqual({ $sample: { size: TRANSITION_POOL_SIZE } });
    expect(db.pipeline.some((stage) => "$sort" in (stage as object))).toBe(false);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain("/upload/w_400,");
    expect(urls[0]).toContain("hm_visuals/media/a.jpg");
  });
});

describe("revalidateMediaSurfaces", () => {
  it("drops the transition's pick at once and refreshes every public page", () => {
    revalidateMediaSurfaces();
    expect(cache.revalidateTag).toHaveBeenCalledWith(TRANSITION_IMAGES_TAG, { expire: 0 });
    expect(cache.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  // Every route that can hide, gate, gallery or replace a photo switches its file
  // delivery through these (SEC8); one that did so without refreshing the pick
  // would leave empty cells in the transition for up to five minutes.
  it("is called by every route that can change which photos are public", () => {
    const changesPublicMedia =
      /syncMediaDelivery|syncPersonMediaDelivery|makeMediaPrivateForGallery|releaseMediaFromPrivateGalleries/;
    const routes = sourceFiles(fromRoot("app/api"), /^route\.ts$/).filter((file) => changesPublicMedia.test(readSource(file)));
    expect(routes.length).toBeGreaterThan(0);
    const missing = routes.filter((file) => !readSource(file).includes("revalidateMediaSurfaces()"));
    expect(missing.map(relativePath)).toEqual([]);
  });
});
