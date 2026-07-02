import Image from "next/image";
import Link from "next/link";

interface PortfolioCardProps {
  href: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  minHeight?: string;
  className?: string;
}

export function PortfolioCard({
  href,
  title,
  description,
  imageUrl,
  ctaLabel = "Explore",
  minHeight = "min-h-[25rem]",
  className,
}: PortfolioCardProps) {
  return (
    <Link
      href={href}
      className={`group relative ${minHeight} overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm${className ? ` ${className}` : ""}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/24 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
        <h2 className="max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">
          {title}
        </h2>

        {description && (
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{description}</p>
        )}

        <div className="mt-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur transition group-hover:bg-white group-hover:text-black">
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
}
