// A person page with no public work shows only the shared fallback text, which Google
// reads as one of many near-copies. Such a page stays visible to visitors but is left
// out of the sitemap and marked noindex (links still followed); it becomes indexable by
// itself as soon as public work is linked to the person.
type WorkCounts = { photoCount: number; videoCount: number };

export function hasPublicWork(person: WorkCounts) {
  return person.photoCount + person.videoCount > 0;
}

export const EMPTY_PROFILE_ROBOTS = { index: false, follow: true } as const;
