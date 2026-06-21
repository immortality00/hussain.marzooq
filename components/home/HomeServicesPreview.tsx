import Link from "next/link";
import type { PublicServiceItem } from "@/lib/server/public-services";

export function HomeServicesPreview({ services }: { services: PublicServiceItem[] }) {
  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="premium-panel p-6 sm:p-8">
        <div className="eyebrow">Services</div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for shoots, films, events, collaborations, and digital projects.
        </h2>

        <Link
          href="/services"
          className="mt-7 inline-flex rounded-full bg-foreground px-5 py-3 text-sm text-background hover:opacity-90"
        >
          View services
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.length ? (
          services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${encodeURIComponent(service.slug)}`}
              className="rounded-[2rem] border bg-background/60 p-5 hover:bg-accent"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {service.category}
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight">{service.name}</h3>

              <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                {service.description || "Premium creative direction shaped around the project."}
              </p>
            </Link>
          ))
        ) : (
          <Link
            href="/services"
            className="rounded-[2rem] border bg-background/60 p-6 text-sm leading-6 text-muted-foreground hover:bg-accent md:col-span-3"
          >
            Explore photography, film, dance, web, NFT, and creative direction services.
          </Link>
        )}
      </div>
    </section>
  );
}