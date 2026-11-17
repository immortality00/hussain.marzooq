import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { DetailPage } from "@/components/shared/DetailPage";
import { chipClasses } from "@/components/shared/chip-classes";
import { StickyCta } from "@/components/site/StickyCta";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogSubscribeForm } from "@/components/blog/BlogSubscribeForm";
import { subscriptionsReady } from "@/lib/server/blog-subscribers";
import { publishedSubscribeCopy } from "@/lib/blog-subscribe-copy";
import { formatBlogDate } from "@/components/blog/formatDate";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";
import { getBlogActive } from "@/lib/server/page-settings";
import { getPostBySlug } from "@/lib/server/public-blog";
import { breadcrumbNode } from "@/lib/seo/structured-data";
import { blogPostingNode } from "@/lib/seo/structured-data-content";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [post, seo] = await Promise.all([getPostBySlug(slug), getPageSeo("blog-detail")]);
  if (!post) return {};

  const title = seo.title.replaceAll("{title}", post.title);
  const description = post.excerpt || seo.description.replaceAll("{title}", post.title);

  return buildPublicMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    image: post.ogImageUrl,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getBlogActive())) redirect("/");

  const [post, sections] = await Promise.all([getPostBySlug(slug), getPageSections("blog")]);

  if (!post) notFound();

  const byline = [`By ${post.author}`, formatBlogDate(post.publishedAt), `${post.readingMinutes} min read`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <JsonLd
        nodes={[
          blogPostingNode(post),
          breadcrumbNode([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <DetailPage backHref="/blog" className="pb-12 sm:pb-16">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight wrap-anywhere sm:text-5xl">
            <AnimatedText revealOnLoad>{post.title}</AnimatedText>
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            {post.categoryLabel ? (
              <Link href={`/blog?category=${post.category}`} className={chipClasses()}>
                {post.categoryLabel}
              </Link>
            ) : null}
            <span>{byline}</span>
          </div>

          {post.coverImageUrl ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[2rem] border bg-muted">
              <SmartImage
                src={post.coverImageUrl}
                alt=""
                fill
                preload
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10">
            <BlogContent content={post.content} />
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {subscriptionsReady() ? (
            <BlogSubscribeForm copy={publishedSubscribeCopy(sections.subscribe)} className="mt-12" />
          ) : null}
        </article>
      </DetailPage>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
