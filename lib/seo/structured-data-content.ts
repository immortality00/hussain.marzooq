import { absoluteUrl } from "@/lib/seo/site-url";
import { DEFAULT_SEARCH_PROFILE, type PublishedProfile } from "@/lib/seo/search-profile";
import { compact, personRef, type JsonLdNode } from "@/lib/seo/structured-data";

export function blogPostingNode(post: {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string | null;
  updatedAt: string | null;
}): JsonLdNode {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const author = post.author.trim() || DEFAULT_SEARCH_PROFILE.name;
  return compact({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: author === DEFAULT_SEARCH_PROFILE.name ? personRef(author) : { "@type": "Person", name: author },
    url,
    mainEntityOfPage: url,
  });
}

export function serviceNode(
  service: {
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    currency: string;
    startingPrice: number | null;
  },
  profile: PublishedProfile,
): JsonLdNode {
  const offers =
    service.startingPrice === null
      ? undefined
      : {
          "@type": "Offer",
          priceCurrency: service.currency,
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: service.startingPrice,
            priceCurrency: service.currency,
          },
        };
  return compact({
    "@type": "Service",
    name: service.name,
    description: service.description,
    image: service.imageUrl,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: personRef(profile.name),
    areaServed: profile.areaServed,
    offers,
  });
}

export function cloudinaryVideoFrameUrl(url: string): string {
  const match = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)\.[a-z0-9]+$/i);
  return match ? `${match[1]}so_0/${match[2]}.jpg` : "";
}

export function videoObjectNode(video: {
  name: string;
  description: string | null;
  posterUrl: string | null;
  contentUrl: string | null;
  embedUrl: string | null;
  uploadDate: string | null;
}): JsonLdNode | null {
  const thumbnailUrl = video.posterUrl || (video.contentUrl ? cloudinaryVideoFrameUrl(video.contentUrl) : "");
  if (!video.name || !thumbnailUrl || !video.uploadDate) return null;
  if (!video.contentUrl && !video.embedUrl) return null;
  return compact({
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
  });
}
