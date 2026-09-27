import { SITE_NAME } from "@/lib/seo/page-metadata";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site-url";
import type { PublishedProfile } from "@/lib/seo/search-profile";

export type JsonLdNode = Record<string, unknown>;

export const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function jsonLdDocument(nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function compact(node: JsonLdNode): JsonLdNode {
  return Object.fromEntries(Object.entries(node).filter(([, value]) => !isEmpty(value)));
}

export function personRef(name: string): JsonLdNode {
  return { "@type": "Person", "@id": PERSON_ID, name, url: SITE_URL };
}

export function personNode(profile: PublishedProfile, description = ""): JsonLdNode {
  const address =
    profile.city || profile.country
      ? compact({ "@type": "PostalAddress", addressLocality: profile.city, addressCountry: profile.country })
      : undefined;
  return compact({
    ...personRef(profile.name),
    jobTitle: profile.jobTitle,
    description: description.trim(),
    image: profile.image,
    email: profile.email,
    telephone: profile.phone,
    address,
    sameAs: profile.links,
  });
}

export function websiteNode(profile: PublishedProfile): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": PERSON_ID, name: profile.name },
  };
}

export function profilePageNode(path: string, person: JsonLdNode): JsonLdNode {
  return { "@type": "ProfilePage", url: absoluteUrl(path), mainEntity: person };
}

export function breadcrumbNode(crumbs: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
