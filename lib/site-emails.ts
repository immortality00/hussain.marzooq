/** The site's public addresses (iCloud+ on hussain.art). Admin alerts, the footer, Contact and Privacy read them here. */
export const SITE_EMAIL = {
  book: "book@hussain.art",
  press: "press@hussain.art",
  privacy: "privacy@hussain.art",
  hussain: "hussain@hussain.art",
} as const;

export type SiteEmailKey = keyof typeof SITE_EMAIL;

export type SiteEmailEntry = { key: SiteEmailKey; label: string; address: string };

/** The order and labels visitors see. */
export const SITE_EMAILS: SiteEmailEntry[] = [
  { key: "book", label: "Bookings", address: SITE_EMAIL.book },
  { key: "press", label: "Press & galleries", address: SITE_EMAIL.press },
  { key: "privacy", label: "Privacy", address: SITE_EMAIL.privacy },
  { key: "hussain", label: "Hussain directly", address: SITE_EMAIL.hussain },
];
