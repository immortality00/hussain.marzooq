import { revalidatePath } from "next/cache";

const MEDIA_BASE_PATHS = ["/", "/photography", "/videography", "/nft"];
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

// Revalidates every surface a media change can affect. Tag subpages are derived
// from the document's own tag slugs (pass old + new on an edit) so a saved doc
// never leaves a stale /photography/[tag] or /videography/[tag] behind — the
// bug §S9 warns about when the path list is hardcoded.
export function revalidateMediaSurfaces(tagSlugs: Iterable<string> = []) {
  for (const path of MEDIA_BASE_PATHS) revalidatePath(path);
  revalidatePublicTree("/people");

  const unique = new Set<string>();
  for (const slug of tagSlugs) {
    if (typeof slug === "string" && slug) unique.add(slug);
  }
  for (const slug of unique) {
    revalidatePath(`/photography/${slug}`);
    revalidatePath(`/videography/${slug}`);
  }
}

export function revalidateSitePages() {
  revalidatePath("/", "layout");
}
