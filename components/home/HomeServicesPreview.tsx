import Link from "next/link";
import type { PublicServiceItem } from "@/lib/server/public-services";

const serviceDirections = [
  "Photography",
  "Videography",
  "Dance",
  "Creative Direction",
  "NFT / Web3",
  "Web Development",
];

export function HomeServicesPreview({ services }: { services: PublicServiceItem[] }) {
  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="premium-panel p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Services built around strong direction, clean delivery, and premium presentation.
        </h2>

        <Link
          href="/services"
          className="mt-7 inline-flex rounded-full bg-foreground px-5 py-3 text-sm text-background hover:opacity-90"
        >
          View services
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.length
          ? services.map((service) => (
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
                  {service.description || "Creative execution tailored to the project."}
                </p>
              </Link>
            ))
          : serviceDirections.map((item) => (
              <Link
                key={item}
                href="/services"
                className="rounded-[2rem] border bg-background/60 p-5 text-sm font-medium hover:bg-accent"
              >
                {item}
              </Link>
            ))}
      </div>
    </section>
  );
}