import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import type { TextCard } from "@/lib/page-sections-shared";

export function AboutDisciplineCard({
  card,
  href,
  className,
  priority = false,
}: {
  card: TextCard;
  href?: string;
  className?: string;
  priority?: boolean;
}) {
  const hasImage = Boolean(card.image?.url);

  const shell = `group relative block min-h-[24rem] overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm lg:min-h-[26rem]${className ? ` ${className}` : ""}`;

  const inner = (
    <>
      {hasImage ? (
        <>
          <SmartImage
            src={card.image.url}
            alt={card.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/24 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <h3
          className={`max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em] ${hasImage ? "text-white" : "text-foreground"}`}
        >
          {card.title}
        </h3>
        <p
          className={`mt-4 max-w-md text-sm leading-6 ${hasImage ? "text-white/70" : "text-muted-foreground"}`}
        >
          {card.text}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={card.title} className={shell}>
        {inner}
      </Link>
    );
  }

  return <article className={shell}>{inner}</article>;
}
