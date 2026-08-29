import SmartImage from "@/components/shared/SmartImage";
import Link from "next/link";
import { workLinkForCategory, type PublicServiceItem } from "@/lib/server/public-services";

// Shared service card used on both the Services page and the homepage Services
// Preview, so both follow the same design. `preview` trims the price chip and
// action-button row for the compact homepage version.
export function ServiceCard({
  service,
  activeSet,
  priority = false,
  preview = false,
}: {
  service: PublicServiceItem;
  activeSet: Set<string>;
  priority?: boolean;
  preview?: boolean;
}) {
  const img = service.imageUrl.trim();
  const hasPrice =
    typeof service.startingPrice === "number" && Number.isFinite(service.startingPrice);
  const workLink = workLinkForCategory(service.category);

  return (
    <article className="group overflow-hidden rounded-[2rem] border bg-background transition-transform duration-300 hover:-translate-y-[2px]">
      <Link href={`/services/${encodeURIComponent(service.slug)}`} className="block">
        <div className="relative h-72 overflow-hidden bg-muted">
          {img ? (
            <SmartImage
              src={img}
              alt={service.name || "Service"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              priority={priority}
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/68 via-black/14 to-transparent" />

          <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] tracking-[0.14em] text-white backdrop-blur">
            {service.category.toUpperCase()}
          </div>

          {!preview && hasPrice ? (
            <div className="absolute right-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white backdrop-blur">
              From {service.currency} {service.startingPrice}
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {service.name || "Service"}
            </h2>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {service.description ||
            "Creative execution tailored to the tone and direction of your project."}
        </p>

        {!preview && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/services/${encodeURIComponent(service.slug)}`}
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
            >
              View details
            </Link>

            <Link
              href={`/contact?service=${encodeURIComponent(service.slug)}&category=${encodeURIComponent(service.category)}`}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book
            </Link>

            {activeSet.has(workLink.href.replace("/", "")) && (
              <Link
                href={workLink.href}
                className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                {workLink.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
