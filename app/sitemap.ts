import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPublishedPosts } from "@/lib/server/public-blog";
import { getPublicPeople } from "@/lib/server/public-people";
import { getPublicServicesData } from "@/lib/server/public-services";
import { getDisciplineTags } from "@/lib/server/public-media-tags";
import { getSitemapSources } from "@/lib/server/sitemap-sources";
import {
  personPageModified,
  postPageModified,
  servicePageModified,
  staticPageModified,
  tagPageModified,
} from "@/lib/sitemap-dates";

export const revalidate = 300;

const ALWAYS_PUBLIC = ["/", "/about", "/services", "/people", "/testimonials", "/contact", "/privacy"];

function entry(path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
    priority,
  };
}

function withSlug<T extends { slug: string }>(items: T[]): T[] {
  return items.filter((item) => Boolean(item.slug));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageSettings, people, { services }, sources] = await Promise.all([
    getAllPageSettings(),
    getPublicPeople(),
    getPublicServicesData(),
    getSitemapSources(),
  ]);

  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  const [posts, photographyTags, videographyTags] = await Promise.all([
    activeSet.has("blog") ? getPublishedPosts() : Promise.resolve([]),
    activeSet.has("photography")
      ? getDisciplineTags({ category: "photography", mediaMode: "image" })
      : Promise.resolve([]),
    activeSet.has("videography")
      ? getDisciplineTags({ category: "videography", mediaMode: "video" })
      : Promise.resolve([]),
  ]);

  const page = (path: string, priority: number) =>
    entry(path, priority, staticPageModified(sources, path));

  return [
    ...ALWAYS_PUBLIC.map((path) => page(path, path === "/" ? 1 : 0.7)),
    ...["photography", "videography", "nft", "dancing", "web-development"]
      .filter((slug) => activeSet.has(slug))
      .map((slug) => page(`/${slug}`, 0.8)),
    ...withSlug(photographyTags).map((tag) =>
      entry(`/photography/${tag.slug}`, 0.6, tagPageModified(sources, "photography", tag.slug))
    ),
    ...withSlug(videographyTags).map((tag) =>
      entry(`/videography/${tag.slug}`, 0.6, tagPageModified(sources, "videography", tag.slug))
    ),
    ...withSlug(services).map((service) =>
      entry(`/services/${service.slug}`, 0.6, servicePageModified(sources, service.slug))
    ),
    ...withSlug(people).map((person) =>
      entry(`/people/${person.slug}`, 0.5, personPageModified(sources, person.slug))
    ),
    ...(activeSet.has("blog") ? [page("/blog", 0.7)] : []),
    ...withSlug(posts).map((post) =>
      entry(`/blog/${post.slug}`, 0.6, postPageModified(sources, post.slug))
    ),
  ];
}
