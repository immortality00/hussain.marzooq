/** The domain every site address is on (iCloud+ Custom Email Domain). */
export const SITE_EMAIL_DOMAIN = "hussain.art";

/** The site's addresses. Admin alerts and Privacy read them here; the public list's defaults are built from them. */
export const SITE_EMAIL = {
  book: `book@${SITE_EMAIL_DOMAIN}`,
  inquiries: `inquiries@${SITE_EMAIL_DOMAIN}`,
  press: `press@${SITE_EMAIL_DOMAIN}`,
  privacy: `privacy@${SITE_EMAIL_DOMAIN}`,
  hussain: `hussain@${SITE_EMAIL_DOMAIN}`,
} as const;

export type SiteEmailKey = keyof typeof SITE_EMAIL;
