import { getAboutSections } from "@/lib/server/page-sections";
import { normalizeSearchProfile, shownProfileLinks } from "@/lib/seo/search-profile";
import { linkLogosOf, socialItems, type SocialItem } from "@/lib/social-links";

// Read by the layout of every public page, so it must never throw: a failed read
// shows no icons rather than an error page.
export async function getSocialItems(): Promise<SocialItem[]> {
  try {
    const about = await getAboutSections();
    return socialItems(shownProfileLinks(normalizeSearchProfile(about.profile)), linkLogosOf(about.linkLogos));
  } catch (error) {
    console.error("[social-links] read failed", error);
    return [];
  }
}
