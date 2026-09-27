import { EMPTY_SECTION_IMAGE, isSectionImage, type SectionImage } from "@/lib/page-sections-shared";
import { isHttpUrl } from "@/lib/http-url";
import { isValidEmail } from "@/app/api/_lib/public-form-security";

export type SearchProfile = {
  name: string;
  jobTitle: string;
  links: string[];
  city: string;
  country: string;
  email: string;
  phone: string;
  areaServed: string;
  image: SectionImage;
};

export type SearchProfileTextField = Exclude<keyof SearchProfile, "links" | "image">;

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
  city: "Dubai",
  country: "United Arab Emirates",
  email: "",
  phone: "",
  areaServed: "Worldwide",
  image: EMPTY_SECTION_IMAGE,
};

const MAX_TEXT = 200;
const MAX_LINKS = 20;
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
  if (isSectionImage(source.image)) profile.image = source.image;
  return profile;
}

export function searchProfileError(profile: SearchProfile): string | null {
  for (const key of TEXT_FIELDS) {
    if (profile[key].length > MAX_TEXT) return `${SEARCH_PROFILE_LABELS[key]} is too long`;
  }
  if (profile.links.length > MAX_LINKS) return `Keep profile links to ${MAX_LINKS} or fewer`;
  const badLink = profile.links.findIndex((link) => !linkIsValid(link));
  if (badLink !== -1) return `Profile link ${badLink + 1} is not a valid web address`;
  if (!emailIsValid(profile.email)) return "Email is not a valid address";
  if (!phoneIsValid(profile.phone)) return "Phone is not a valid number";
  return null;
}

export type PublishedProfile = Omit<SearchProfile, "image"> & { image: string };

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
