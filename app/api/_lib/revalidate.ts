import { revalidatePath } from "next/cache";

const MEDIA_BASE_PATHS = ["/", "/photography", "/videography", "/nft"];

// Revalidates every surface a media change can affect. Tag subpages are derived
// from the document's own tag slugs (pass old + new on an edit) so a saved doc
// never leaves a stale /photography/[tag] or /videography/[tag] behind — the
// bug §S9 warns about when the path list is hardcoded.
export function revalidateMediaSurfaces(tagSlugs: Iterable<string> = []) {
  for (const path of MEDIA_BASE_PATHS) revalidatePath(path);
  revalidatePath("/people", "layout");

  const unique = new Set<string>();
  for (const slug of tagSlugs) {
    if (typeof slug === "string" && slug) unique.add(slug);
  }
  for (const slug of unique) {
    revalidatePath(`/photography/${slug}`);
    revalidatePath(`/videography/${slug}`);
  }
}
