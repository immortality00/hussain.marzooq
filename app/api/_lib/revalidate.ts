import { revalidatePath, revalidateTag } from "next/cache";
import { TRANSITION_IMAGES_TAG } from "@/lib/transition-images";

const PUBLIC_ROUTE_GROUP = "/(site)";

function publicRoutePath(path: string) {
  return path === "/" ? "/" : `${PUBLIC_ROUTE_GROUP}${path}`;
}

export function revalidatePublicTree(path: string) {
  revalidatePath(publicRoutePath(path), "layout");
}

export function revalidatePublicPattern(pattern: string) {
  revalidatePath(publicRoutePath(pattern), "page");
}

// Every public page carries the page-transition photos (a cached random pick in
// the (site) layout), so any change to which photos are public, or to their
// files, drops that pick and refreshes every page — which also covers the
// discipline, tag, people and home pages that show the media itself.
// expire: 0 makes the next request pick again rather than be served the old pick
// while it does, so a hidden or deleted photo never shows as an empty cell.
export function revalidateMediaSurfaces() {
  revalidateTag(TRANSITION_IMAGES_TAG, { expire: 0 });
  revalidateSitePages();
}

export function revalidateSitePages() {
  revalidatePath("/", "layout");
}
