import { isSectionImage, type SectionImage } from "@/lib/page-sections-shared";
import { heroFocusOf, isBadHeroFocus, type HeroFocus } from "@/lib/hero-focus";

// The homepage hero's photo strips. Runtime-agnostic: the public hero, the admin
// form, the page-sections save route and the stored-data reader all use it.

export type HeroPhoto = SectionImage & { focus?: HeroFocus };

export const HERO_MAX_PHOTOS = 10;
// Phones show only the first five, so a closed strip stays wide enough to tap.
export const HERO_PHONE_MAX_PHOTOS = 5;
// Matches the `(max-width: 767px)` queries in app/styles/hero.css.
export const HERO_PHONE_MAX_WIDTH = 767;

// The open photo's share of the hero's width, whatever the number of photos.
const OPEN_SHARE = 0.4;
const PHONE_OPEN_SHARE = 0.6;
// A portrait filling the hero's height is about this wide (the work is 9:16 to 2:3).
// 0.66, not 2/3: at 900px tall and 2x it asks for 1188px and gets the 1200 file,
// where 2/3 would tip over 1200 and fetch the 1920 one.
const PORTRAIT_WIDTH_PER_HEIGHT = 0.66;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

// Reads `hero.images`, or the single `hero.image` saved before the list existed.
// Empty slots are dropped: that is how a removed photo leaves the list. A broken
// focus is dropped too, so that photo is centred.
export function heroPhotosOf(hero: unknown): HeroPhoto[] {
  const value = record(hero);
  const list: unknown[] = Array.isArray(value.images) ? value.images : [value.image];
  return list.flatMap((photo) => {
    if (!isSectionImage(photo) || photo.url.trim() === "") return [];
    const focus = heroFocusOf(record(photo).focus);
    return [{ url: photo.url, publicId: photo.publicId, ...(focus ? { focus } : {}) }];
  });
}

export function heroForSave(hero: unknown): { images: HeroPhoto[] } | { error: string } {
  if (!hero || typeof hero !== "object" || Array.isArray(hero)) {
    return { error: "Hero photos must be a list of images." };
  }
  const value = hero as Record<string, unknown>;
  if ("images" in value) {
    if (!Array.isArray(value.images) || !value.images.every(isSectionImage)) {
      return { error: "Hero photos must be a list of images." };
    }
    if (value.images.length > HERO_MAX_PHOTOS) {
      return { error: `The hero takes up to ${HERO_MAX_PHOTOS} photos.` };
    }
    if (value.images.some((photo) => isBadHeroFocus(record(photo).focus))) {
      return { error: "A hero photo's framing must be two numbers from 0 to 100." };
    }
  }
  return { images: heroPhotosOf(value) };
}

// flex-grow of the open strip when every other strip grows 1.
export function heroOpenGrow(count: number, share: number): number {
  return Math.max(2, (share * (count - 1)) / (1 - share));
}

function openShare(count: number, share: number): number {
  const grow = heroOpenGrow(count, share);
  return grow / (grow + count - 1);
}

// The open strip’s share of the hero’s width for this many strips; one photo fills it.
export function heroOpenShare(count: number, phone = false): number {
  return count > 1 ? openShare(count, phone ? PHONE_OPEN_SHARE : OPEN_SHARE) : 1;
}

export function heroLayout(total: number) {
  const narrow = Math.min(total, HERO_PHONE_MAX_PHOTOS);
  return {
    wide: { count: total, open: heroOpenGrow(total, OPEN_SHARE) },
    narrow: { count: narrow, open: heroOpenGrow(narrow, PHONE_OPEN_SHARE) },
  };
}

// The open photo is as wide as its strip or, when the strip is narrower than a
// portrait at full height, as wide as that portrait; the media condition picks
// whichever is larger. Phones keep the single hero's 100vw: a strip is narrower
// than the screen and fills the same height, so it gets the same file density.
export function heroPhotoSizes(total: number): string {
  if (total <= 1) return "100vw";
  const open = openShare(total, OPEN_SHARE);
  const ratio = `${Math.round((PORTRAIT_WIDTH_PER_HEIGHT / open) * 1000)}/1000`;
  return [
    `(max-width: ${HERO_PHONE_MAX_WIDTH}px) 100vw`,
    `(min-aspect-ratio: ${ratio}) ${Math.ceil(open * 100)}vw`,
    `${Math.round(PORTRAIT_WIDTH_PER_HEIGHT * 100)}vh`,
  ].join(", ");
}
