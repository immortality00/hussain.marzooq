import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { NoResults } from "@/components/shared/NoResults";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";
import { getBlogActive } from "@/lib/server/page-settings";
import { getPublishedPosts, getPublicBlogCategories } from "@/lib/server/public-blog";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("blog");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    image: seo.ogImageUrl,
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!(await getBlogActive())) redirect("/");

  const { category } = await searchParams;
  const activeCategory = typeof category === "string" ? category : "";

  const [seo, content, categories, posts] = await Promise.all([
    getPageSeo("blog"),
    getPageSections("blog"),
    getPublicBlogCategories(),
    getPublishedPosts(activeCategory || undefined),
  ]);

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader title={seo.headerTitle} description={seo.headerDescription} className="max-w-3xl" />

        {categories.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            <CategoryChip href="/blog" label="All" active={!activeCategory} />
            {categories.map((c) => (
              <CategoryChip
                key={c.slug}
                href={`/blog?category=${c.slug}`}
                label={c.label}
                active={activeCategory === c.slug}
              />
            ))}
          </div>
        ) : null}

        {posts.length > 0 ? (
          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} priority={i < 3} />
            ))}
          </section>
        ) : (
          <NoResults className="mt-10">Nothing published here yet.</NoResults>
        )}
      </main>

      <StickyCta
        title={content.stickyCta.title}
        description={content.stickyCta.description}
        buttonLabel={content.stickyCta.buttonLabel}
      />
    </>
  );
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "hover:bg-accent"
      }`}
    >
      {label}
    </Link>
  );
}
