import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import { formatBlogDate } from "./formatDate";
import type { BlogPostCard } from "@/lib/server/public-blog";

export function BlogCard({ post, priority = false }: { post: BlogPostCard; priority?: boolean }) {
  const meta = [post.categoryLabel, formatBlogDate(post.publishedAt), `${post.readingMinutes} min read`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-[2rem] border bg-muted transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImageUrl ? (
          <SmartImage
            src={post.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {meta ? (
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {meta}
          </div>
        ) : null}

        <h2 className="mt-3 text-xl font-semibold tracking-tight">{post.title}</h2>

        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        ) : null}

        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
