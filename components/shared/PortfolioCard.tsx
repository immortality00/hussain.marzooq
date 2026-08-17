import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/shared/Button";

interface PortfolioCardProps {
  href: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  priority?: boolean;
  tags?: { label: string; href: string }[];
  minHeight?: string;
  className?: string;
}

export function PortfolioCard({
  href,
  title,
  description,
  imageUrl,
  ctaLabel = "Explore",
  priority = false,
  tags,
  minHeight = "min-h-[25rem]",
  className,
}: PortfolioCardProps) {
  // A card with tag links cannot itself be an <a> (nested anchors are invalid).
  // Structure: a div with an absolutely-positioned cover link for the whole-card
  // click, non-interactive content marked pointer-events-none so clicks fall
  // through to the cover, and any tag links re-enabled above it in z-order.
  return (
    <div
      className={`group relative ${minHeight} overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm${className ? ` ${className}` : ""}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/24 to-transparent" />

      <Link href={href} aria-label={title} className="absolute inset-0 z-10" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 text-white sm:p-7">
        <h2 className="max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">
          {title}
        </h2>

        {description && (
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{description}</p>
        )}

        {tags && tags.length > 0 && (
          <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.href}
                href={tag.href}
                className="hm-chip border-white/25 bg-white/10 text-white backdrop-blur-[10px] hover:bg-white hover:text-black"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        {/* The cover link handles navigation, so this is a non-interactive
            span; it inverts on card hover (group-hover) rather than its own. */}
        <span
          className={buttonClasses(
            "ghost",
            "mt-6 group-hover:border-white group-hover:bg-white group-hover:text-black",
          )}
        >
          {ctaLabel}
        </span>
      </div>
    </div>
  );
}
