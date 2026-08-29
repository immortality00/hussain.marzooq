import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { StickyCta } from "@/components/site/StickyCta";
import { BlogContent } from "@/components/blog/BlogContent";
import { formatBlogDate } from "@/components/blog/formatDate";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";
import { getBlogActive } from "@/lib/server/page-settings";
import { getPostBySlug } from "@/lib/server/public-blog";

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

  const meta = [formatBlogDate(post.publishedAt), `${post.readingMinutes} min read`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {post.categoryLabel ? (
              <Link
                href={`/blog?category=${post.category}`}
                className="rounded-full border px-3.5 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                {post.categoryLabel}
              </Link>
            ) : null}
            {meta ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {meta}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            <AnimatedText>{post.title}</AnimatedText>
          </h1>

          <div className="mt-4 text-sm text-muted-foreground">By {post.author}</div>

          {post.coverImageUrl ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[2rem] border bg-muted">
              <SmartImage
                src={post.coverImageUrl}
                alt=""
                fill
                priority
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
        </article>
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
