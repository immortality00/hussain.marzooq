import type { PageSectionsSlug } from "@/lib/server/page-sections";
import { profileForSave } from "@/lib/seo/search-profile";
import { heroForSave } from "@/lib/hero-photos";
import { EMAIL_HEADING_MAX, emailListForSave } from "@/lib/email-list";
import { subscribeCopyForSave } from "@/lib/blog-subscribe-copy";

type Saved = { data: Record<string, unknown> } | { error: string };

// Contact keeps only its own two fields, so nothing else can reach the footer's read.
function contactForSave(data: Record<string, unknown>): Saved {
  const saved: Record<string, unknown> = {};
  if ("heading" in data) {
    if (typeof data.heading !== "string") return { error: "The heading must be text." };
    if (data.heading.trim().length > EMAIL_HEADING_MAX) {
      return { error: `The heading is over ${EMAIL_HEADING_MAX} characters.` };
    }
    saved.heading = data.heading.trim();
  }
  if ("emails" in data) {
    const list = emailListForSave(data.emails);
    if ("error" in list) return list;
    saved.emails = list.emails;
  }
  return { data: saved };
}

/** The checked sections blob for a page, or the reason it is refused. Pages without rules pass through. */
export function sectionsForSave(slug: PageSectionsSlug, data: Record<string, unknown>): Saved {
  if (slug === "about" && "profile" in data) {
    const saved = profileForSave(data.profile);
    return "error" in saved ? saved : { data: { ...data, profile: saved.profile } };
  }
  if (slug === "home" && "hero" in data) {
    const hero = heroForSave(data.hero);
    return "error" in hero ? hero : { data: { ...data, hero } };
  }
  if (slug === "blog" && "subscribe" in data) {
    const saved = subscribeCopyForSave(data.subscribe);
    return "error" in saved ? saved : { data: { ...data, subscribe: saved.subscribe } };
  }
  if (slug === "contact") return contactForSave(data);
  return { data };
}
