import { EMPTY_SECTION_IMAGE, isSectionImage, type SectionImage } from "@/lib/page-sections-shared";
import { isHttpUrl } from "@/lib/http-url";
import { isValidEmail } from "@/app/api/_lib/public-form-security";
import { MAX_PROFILE_LINKS, linksFromRows, type ProfileLinkRow } from "@/lib/profile-links";

export type SearchProfile = {
  name: string;
  jobTitle: string;
  links: string[];
  // The links also shown as icons on the site. Every link is given to search
  // engines; a new one stays off the site until it is switched on.
  shownLinks: string[];
  city: string;
  country: string;
  email: string;
  phone: string;
  areaServed: string;
  image: SectionImage;
};

// The editor's draft: the link rows as typed (network + username), which the save
// route turns into `links` and `shownLinks`. Never stored.
export type SearchProfileDraft = SearchProfile & { linkRows?: ProfileLinkRow[] };

export type SearchProfileTextField = Exclude<keyof SearchProfile, "links" | "shownLinks" | "image">;

export const SEARCH_PROFILE_LABELS: Record<SearchProfileTextField, string> = {
  name: "Name",
  jobTitle: "Job title",
  city: "City",
  country: "Country",
  email: "Email",
  phone: "Phone",
  areaServed: "Area served",
};

const TEXT_FIELDS = Object.keys(SEARCH_PROFILE_LABELS) as SearchProfileTextField[];

export const DEFAULT_SEARCH_PROFILE: SearchProfile = {
  name: "Hussain Marzooq",
  jobTitle: "",
  links: [],
  shownLinks: [],
  city: "Dubai",
  country: "United Arab Emirates",
  email: "",
  phone: "",
  areaServed: "Worldwide",
  image: EMPTY_SECTION_IMAGE,
};

const MAX_TEXT = 200;
const MAX_LINK = 500;
const PHONE_PATTERN = /^\+?[0-9 ()\-.]{6,24}$/;

export function linkIsValid(link: string) {
  const trimmed = link.trim();
  return !trimmed || (trimmed.length <= MAX_LINK && isHttpUrl(trimmed));
}

export function emailIsValid(email: string) {
  return !email.trim() || isValidEmail(email);
}

export function phoneIsValid(phone: string) {
  return !phone.trim() || PHONE_PATTERN.test(phone.trim());
}

export function normalizeSearchProfile(value: unknown): SearchProfile {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const profile: SearchProfile = { ...DEFAULT_SEARCH_PROFILE };
  for (const key of TEXT_FIELDS) {
    if (typeof source[key] === "string") profile[key] = source[key];
  }
  if (Array.isArray(source.links)) {
    profile.links = source.links.filter((link): link is string => typeof link === "string");
  }
  if (Array.isArray(source.shownLinks)) {
    const listed = new Set(profile.links);
    profile.shownLinks = Array.from(
      new Set(source.shownLinks.filter((link): link is string => typeof link === "string" && listed.has(link)))
    );
  }
  if (isSectionImage(source.image)) profile.image = source.image;
  return profile;
}

export function searchProfileError(profile: SearchProfile): string | null {
  for (const key of TEXT_FIELDS) {
    if (profile[key].length > MAX_TEXT) return `${SEARCH_PROFILE_LABELS[key]} is too long`;
  }
  if (profile.links.length > MAX_PROFILE_LINKS) return `Keep profile links to ${MAX_PROFILE_LINKS} or fewer`;
  const badLink = profile.links.findIndex((link) => !linkIsValid(link));
  if (badLink !== -1) return `Profile link ${badLink + 1} is not a valid web address`;
  if (!emailIsValid(profile.email)) return "Email is not a valid address";
  if (!phoneIsValid(profile.phone)) return "Phone is not a valid number";
  return null;
}

// The profile a save stores. A draft's link rows are built into addresses here,
// with the same rule the editor previews; a body without rows (an editor opened
// before rows existed) is checked as plain addresses.
export function profileForSave(value: unknown): { profile: SearchProfile } | { error: string } {
  let source = value;
  if (value && typeof value === "object" && !Array.isArray(value) && "linkRows" in value) {
    const built = linksFromRows((value as { linkRows: unknown }).linkRows);
    if ("error" in built) return built;
    source = { ...value, ...built };
  }
  const profile = normalizeSearchProfile(source);
  const error = searchProfileError(profile);
  return error ? { error } : { profile };
}

// The profile links shown as icons on the site, in the profile's order.
export function shownProfileLinks(profile: SearchProfile): string[] {
  const shown = new Set(profile.shownLinks);
  return profile.links.filter((link) => shown.has(link));
}

export type PublishedProfile = Omit<SearchProfile, "image" | "shownLinks"> & { image: string };

export function publishedProfile(profile: SearchProfile): PublishedProfile {
  const clean = (value: string, valid = true) => (valid ? value.trim() : "");
  return {
    name: profile.name.trim() || DEFAULT_SEARCH_PROFILE.name,
    jobTitle: clean(profile.jobTitle),
    links: profile.links.map((link) => link.trim()).filter((link) => link && linkIsValid(link)),
    city: clean(profile.city),
    country: clean(profile.country),
    email: clean(profile.email, emailIsValid(profile.email)),
    phone: clean(profile.phone, phoneIsValid(profile.phone)),
    areaServed: clean(profile.areaServed),
    image: profile.image.url.trim(),
  };
}
