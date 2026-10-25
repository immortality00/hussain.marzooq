// The page-transition photos (getTransitionImages, lib/server/public-media.ts):
// the cache tag that drops the current pick, and how many photos a pick holds.
// Kept apart from the database code so route helpers can import the tag alone.
export const TRANSITION_IMAGES_TAG = "transition-images";
export const TRANSITION_POOL_SIZE = 24;
