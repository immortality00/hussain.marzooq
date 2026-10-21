import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  HERO_MAX_PHOTOS,
  HERO_PHONE_MAX_WIDTH,
  heroForSave,
  heroLayout,
  heroPhotoSizes,
  heroPhotosOf,
} from "@/lib/hero-photos";
import { heroPreviewShapes } from "@/lib/hero-preview";
import { pageSectionsOf, type HomeSections } from "@/lib/server/page-sections";

const photo = (n: number) => ({ url: `https://res.cloudinary.com/demo/image/upload/v1/p${n}.jpg`, publicId: "" });
const empty = { url: "", publicId: "" };

describe("heroPhotosOf", () => {
  test("reads the photo list in order", () => {
    expect(heroPhotosOf({ images: [photo(1), photo(2)] })).toEqual([photo(1), photo(2)]);
  });

  test("a hero saved before the list reads as a one-photo list", () => {
    expect(heroPhotosOf({ image: photo(1) })).toEqual([photo(1)]);
    expect(heroPhotosOf({ image: empty })).toEqual([]);
  });

  test("the list wins over a leftover single image", () => {
    expect(heroPhotosOf({ images: [photo(2)], image: photo(1) })).toEqual([photo(2)]);
    expect(heroPhotosOf({ images: [], image: photo(1) })).toEqual([]);
  });

  test("keeps each photo's framing and drops a broken one (that photo is centred)", () => {
    expect(heroPhotosOf({ images: [{ ...photo(1), focus: { x: 20, y: 30 } }] })).toEqual([
      { ...photo(1), focus: { x: 20, y: 30 } },
    ]);
    expect(heroPhotosOf({ images: [{ ...photo(1), focus: { x: 20 } }] })).toEqual([photo(1)]);
  });

  test("empty slots and anything that is not an image are dropped", () => {
    expect(heroPhotosOf({ images: [photo(1), empty, { url: 3 }, null, photo(2)] })).toEqual([photo(1), photo(2)]);
    expect(heroPhotosOf(undefined)).toEqual([]);
    expect(heroPhotosOf("x")).toEqual([]);
  });
});

describe("heroForSave", () => {
  test("keeps the photos in order and drops empty slots", () => {
    expect(heroForSave({ images: [photo(1), empty, photo(2)] })).toEqual({ images: [photo(1), photo(2)] });
  });

  test("an old-style single image is saved as a list", () => {
    expect(heroForSave({ image: photo(1) })).toEqual({ images: [photo(1)] });
  });

  test(`takes up to ${HERO_MAX_PHOTOS} photos`, () => {
    const max = Array.from({ length: HERO_MAX_PHOTOS }, (_, i) => photo(i));
    expect(heroForSave({ images: max })).toEqual({ images: max });
    expect(heroForSave({ images: [...max, photo(99)] })).toEqual({ error: "The hero takes up to 10 photos." });
  });

  test("saves framing, and refuses a framing that is not two numbers from 0 to 100", () => {
    expect(heroForSave({ images: [{ ...photo(1), focus: { x: 12.34, y: 80 } }] })).toEqual({
      images: [{ ...photo(1), focus: { x: 12.3, y: 80 } }],
    });
    expect(heroForSave({ images: [{ ...photo(1), focus: { x: 12, y: 180 } }] })).toEqual({
      error: "A hero photo's framing must be two numbers from 0 to 100.",
    });
  });

  test("refuses anything that is not a list of images", () => {
    const error = { error: "Hero photos must be a list of images." };
    expect(heroForSave(null)).toEqual(error);
    expect(heroForSave([photo(1)])).toEqual(error);
    expect(heroForSave({ images: "x" })).toEqual(error);
    expect(heroForSave({ images: [photo(1), { url: "x" }] })).toEqual(error);
  });
});

describe("layout", () => {
  test("the open photo keeps about the same share of the width whatever the count", () => {
    const share = (count: number, open: number) => open / (open + count - 1);
    for (const total of [4, 6, 10]) {
      const { wide, narrow } = heroLayout(total);
      expect(share(wide.count, wide.open)).toBeCloseTo(0.4);
      expect(share(narrow.count, narrow.open)).toBeCloseTo(0.6);
    }
  });

  test("phones show at most five strips", () => {
    expect(heroLayout(10).narrow.count).toBe(5);
    expect(heroLayout(3).narrow.count).toBe(3);
    expect(heroLayout(10).wide.count).toBe(10);
  });

  test("with two or three photos the open one is still twice a closed one", () => {
    expect(heroLayout(2).wide.open).toBe(2);
    expect(heroLayout(3).wide.open).toBe(2);
  });
});

describe("heroPreviewShapes", () => {
  test("ten photos: open on desktop, one strip at rest, open on a phone", () => {
    const shapes = heroPreviewShapes(10);
    expect(shapes.map((s) => s.key)).toEqual(["desktop", "rest", "phone"]);
    expect(shapes[0]).toMatchObject({ strip: 576, photo: 576, height: 851 });
    expect(shapes[1]).toMatchObject({ strip: 144, photo: 576 });
    expect(shapes[2]!.strip).toBeCloseTo(225);
  });

  test("one photo has no rest state and fills the width", () => {
    const shapes = heroPreviewShapes(1);
    expect(shapes.map((s) => [s.key, s.strip])).toEqual([
      ["desktop", 1440],
      ["phone", 375],
    ]);
  });
});

describe("heroPhotoSizes", () => {
  test("one photo is the full width, as before", () => {
    expect(heroPhotoSizes(1)).toBe("100vw");
    expect(heroPhotoSizes(0)).toBe("100vw");
  });

  test("several photos ask for the open strip or a full-height portrait, whichever is wider", () => {
    expect(heroPhotoSizes(10)).toBe("(max-width: 767px) 100vw, (min-aspect-ratio: 1650/1000) 40vw, 66vh");
    expect(heroPhotoSizes(3)).toBe("(max-width: 767px) 100vw, (min-aspect-ratio: 1320/1000) 50vw, 66vh");
  });

  test("a 1440x900 screen at 2x gets the 1200 file — the open photo shows at most 600px wide", () => {
    const vh = Number(heroPhotoSizes(10).match(/(\d+)vh$/)![1]);
    expect(Math.ceil((900 * vh) / 100) * 2).toBeLessThanOrEqual(1200);
  });

  test("next/image reads the vw values, so its srcset starts at a sensible width", () => {
    const vw = [...heroPhotoSizes(10).matchAll(/(^|\s)(1?\d?\d)vw/g)].map((match) => Number(match[2]));
    expect(vw).toEqual([100, 40]);
  });
});

describe("the stylesheet and the stored data agree with the helpers", () => {
  test("hero.css switches to the phone layout at the same width", () => {
    const css = readFileSync("app/styles/hero.css", "utf8");
    expect(css).toContain(`(max-width: ${HERO_PHONE_MAX_WIDTH}px)`);
    expect(readFileSync("app/globals.css", "utf8")).toContain('@import "./styles/hero.css";');
  });

  test("a stored home doc with the old single image reads as a photo list", () => {
    const stored = pageSectionsOf("home", { slug: "home", data: { hero: { image: photo(1) } } });
    expect((stored.data as HomeSections).hero).toEqual({ images: [photo(1)] });
  });

  test("an unsaved home page has no hero photos", () => {
    expect((pageSectionsOf("home", null).data as HomeSections).hero).toEqual({ images: [] });
  });
});
