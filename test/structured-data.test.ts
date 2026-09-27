import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo/site-url";
import { DEFAULT_SEARCH_PROFILE, publishedProfile } from "@/lib/seo/search-profile";
import {
  PERSON_ID,
  breadcrumbNode,
  personNode,
  profilePageNode,
  serializeJsonLd,
  websiteNode,
} from "@/lib/seo/structured-data";
import {
  blogPostingNode,
  cloudinaryVideoFrameUrl,
  serviceNode,
  videoObjectNode,
} from "@/lib/seo/structured-data-content";

const HOSTILE = `</script><script>alert(1)</script> & "q" <!-- x`;
const profile = publishedProfile(DEFAULT_SEARCH_PROFILE);

function innerJson(html: string) {
  return html.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "");
}

describe("JsonLd rendering", () => {
  test("a hostile value cannot close the script, and the data reads back unchanged", () => {
    const node = { "@type": "Thing", name: HOSTILE };
    const html = renderToStaticMarkup(createElement(JsonLd, { nodes: [node] }));

    expect(html.match(/<\/script/gi)).toHaveLength(1);
    expect(html).not.toContain("<!--");
    expect(JSON.parse(innerJson(html))["@graph"][0].name).toBe(HOSTILE);
  });

  test("the server output is exactly the string the browser renders, so hydration matches", () => {
    const nodes = [{ "@type": "Thing", name: HOSTILE }];
    const html = renderToStaticMarkup(createElement(JsonLd, { nodes }));
    expect(innerJson(html)).toBe(serializeJsonLd({ "@context": "https://schema.org", "@graph": nodes }));
  });

  test("renders nothing when every node is missing", () => {
    expect(renderToStaticMarkup(createElement(JsonLd, { nodes: [null] }))).toBe("");
  });

  test("serializeJsonLd leaves no raw <", () => {
    expect(serializeJsonLd({ a: "<b>" })).toBe('{"a":"\\u003cb>"}');
  });
});

describe("person and site", () => {
  test("defaults publish name, url and city, and leave every empty field out", () => {
    expect(personNode(profile)).toEqual({
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Hussain Marzooq",
      url: SITE_URL,
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "United Arab Emirates" },
    });
  });

  test("a filled profile carries links, title, contact, portrait and description", () => {
    const filled = publishedProfile({
      ...DEFAULT_SEARCH_PROFILE,
      name: "  ",
      jobTitle: "Photographer",
      links: ["https://instagram.com/h", "", "javascript:alert(1)"],
      email: "h@example.com",
      phone: "+971 50 000 0000",
      city: "",
      country: "",
      image: { url: "https://res.cloudinary.com/demo/image/upload/p.jpg", publicId: "" },
    });
    const node = personNode(filled, "Bio");
    expect(node).toMatchObject({
      name: "Hussain Marzooq",
      jobTitle: "Photographer",
      sameAs: ["https://instagram.com/h"],
      email: "h@example.com",
      telephone: "+971 50 000 0000",
      image: "https://res.cloudinary.com/demo/image/upload/p.jpg",
      description: "Bio",
    });
    expect(node).not.toHaveProperty("address");
  });

  test("WebSite names the brand and points at the person", () => {
    expect(websiteNode(profile)).toMatchObject({
      "@type": "WebSite",
      name: "Hussain.Art",
      url: SITE_URL,
      publisher: { "@id": PERSON_ID },
    });
  });

  test("ProfilePage wraps the person", () => {
    const person = personNode(profile);
    expect(profilePageNode("/about", person)).toEqual({
      "@type": "ProfilePage",
      url: `${SITE_URL}/about`,
      mainEntity: person,
    });
  });

  test("breadcrumbs start at Home and number from 1 with absolute URLs", () => {
    expect(breadcrumbNode([{ name: "Services", path: "/services" }]).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
    ]);
  });
});

describe("content", () => {
  const post = {
    slug: "night",
    title: "Night shoot",
    excerpt: "",
    coverImageUrl: "",
    author: "Hussain Marzooq",
    publishedAt: "2026-09-01T00:00:00.000Z",
    updatedAt: null,
  };

  test("a blog post falls back to its publish date and links its author to the person", () => {
    const node = blogPostingNode(post);
    expect(node).toMatchObject({
      headline: "Night shoot",
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      author: { "@id": PERSON_ID },
      url: `${SITE_URL}/blog/night`,
    });
    expect(node).not.toHaveProperty("image");
    expect(node).not.toHaveProperty("description");
  });

  test("another author is never given the person's id", () => {
    expect(blogPostingNode({ ...post, author: "Guest" }).author).toEqual({ "@type": "Person", name: "Guest" });
  });

  const service = {
    slug: "portraits",
    name: "Portraits",
    description: "Studio portraits",
    imageUrl: "",
    currency: "AED",
    startingPrice: null as number | null,
  };

  test("a service without a price carries no offer", () => {
    const node = serviceNode(service, profile);
    expect(node).toMatchObject({ name: "Portraits", areaServed: "Worldwide", provider: { "@id": PERSON_ID } });
    expect(node).not.toHaveProperty("offers");
  });

  test("a service price is a starting price", () => {
    expect(serviceNode({ ...service, startingPrice: 1500 }, profile).offers).toEqual({
      "@type": "Offer",
      priceCurrency: "AED",
      priceSpecification: { "@type": "PriceSpecification", minPrice: 1500, priceCurrency: "AED" },
    });
  });
});

describe("showreel video", () => {
  const FILE = "https://res.cloudinary.com/demo/video/upload/v17/hm_visuals/media/showreel/reel.mp4";
  const base = {
    name: "Showreel",
    description: null,
    posterUrl: null,
    contentUrl: null,
    embedUrl: null,
    uploadDate: "2026-09-01T00:00:00.000Z",
  };

  test("an uploaded file gets a real frame from Cloudinary as its thumbnail", () => {
    expect(cloudinaryVideoFrameUrl(FILE)).toBe(
      "https://res.cloudinary.com/demo/video/upload/so_0/v17/hm_visuals/media/showreel/reel.jpg",
    );
    expect(videoObjectNode({ ...base, contentUrl: FILE })).toMatchObject({
      contentUrl: FILE,
      thumbnailUrl: cloudinaryVideoFrameUrl(FILE),
    });
  });

  test("an embedded video uses its stored thumbnail", () => {
    const node = videoObjectNode({
      ...base,
      posterUrl: "https://res.cloudinary.com/demo/image/upload/poster.jpg",
      embedUrl: "https://www.youtube-nocookie.com/embed/abcdefghijk",
    });
    expect(node).toMatchObject({ thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/poster.jpg" });
    expect(node).not.toHaveProperty("contentUrl");
  });

  test("nothing is published without a thumbnail, a date or a player", () => {
    expect(videoObjectNode({ ...base, embedUrl: "https://player.vimeo.com/video/1" })).toBeNull();
    expect(videoObjectNode({ ...base, contentUrl: FILE, uploadDate: null })).toBeNull();
    expect(videoObjectNode({ ...base, posterUrl: "https://res.cloudinary.com/p.jpg" })).toBeNull();
    expect(cloudinaryVideoFrameUrl("https://example.com/reel.mp4")).toBe("");
  });
});
