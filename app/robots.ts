import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

// Pre-filled contact links and filter views: every person, NFT and service page links to
// its own /contact?…, so crawling them spends Google's small budget on copies of one page
// (canonical /contact). The pages themselves stay crawlable — a rule matches by prefix.
const FILTERED_PAGES = ["/contact?", "/services?", "/blog?"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/g/", "/api/", ...FILTERED_PAGES] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
