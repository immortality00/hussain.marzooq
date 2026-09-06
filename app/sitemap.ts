import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPublishedPosts } from "@/lib/server/public-blog";
import { getPublicPeople } from "@/lib/server/public-people";
import { getPublicServicesData } from "@/lib/server/public-services";
import { getDisciplineTags } from "@/lib/server/public-media-tags";

export const revalidate = 300;

const ALWAYS_PUBLIC = ["/", "/about", "/services", "/people", "/testimonials", "/contact", "/privacy"];

function entry(path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: lastModified ?? new Date(),
    priority,
  };
}

function withSlug<T extends { slug: string }>(items: T[]): T[] {
  return items.filter((item) => Boolean(item.slug));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageSettings, people, { services }] = await Promise.all([
    getAllPageSettings(),
    getPublicPeople(),
    getPublicServicesData(),
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

  return [
    ...ALWAYS_PUBLIC.map((path) => entry(path, path === "/" ? 1 : 0.7)),
    ...["photography", "videography", "nft", "dancing", "web-development"]
      .filter((slug) => activeSet.has(slug))
      .map((slug) => entry(`/${slug}`, 0.8)),
    ...withSlug(photographyTags).map((tag) => entry(`/photography/${tag.slug}`, 0.6)),
    ...withSlug(videographyTags).map((tag) => entry(`/videography/${tag.slug}`, 0.6)),
    ...withSlug(services).map((service) => entry(`/services/${service.slug}`, 0.6)),
    ...withSlug(people).map((person) => entry(`/people/${person.slug}`, 0.5)),
    ...(activeSet.has("blog") ? [entry("/blog", 0.7)] : []),
    ...withSlug(posts).map((post) =>
      entry(`/blog/${post.slug}`, 0.6, post.publishedAt ? new Date(post.publishedAt) : undefined)
    ),
  ];
}
