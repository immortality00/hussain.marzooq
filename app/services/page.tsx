import Image from "next/image";
import Link from "next/link";
import { getPublicServicesData, workLinkForCategory } from "@/lib/server/public-services";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const selectedCategory = typeof sp.category === "string" ? sp.category : "all";

  const { services: servicesAll, categories } = await getPublicServicesData();

  const services =
    selectedCategory === "all"
      ? servicesAll
      : servicesAll.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  const tabs = [{ slug: "all", name: "All" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Services</h1>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.slug === selectedCategory;
          return (
            <Link
              key={t.slug}
              href={t.slug === "all" ? "/services" : `/services?category=${encodeURIComponent(t.slug)}`}
              className={[
                "rounded-full border px-4 py-2 text-xs transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-accent",
              ].join(" ")}
            >
              {t.name}
            </Link>
          );
        })}
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.length === 0 ? (
          <div className="rounded-3xl border p-8 text-sm text-muted-foreground">
            No services found for this category yet.
          </div>
        ) : (
          services.map((s, index) => {
            const img = s.imageUrl.trim();
            const hasPrice = typeof s.startingPrice === "number" && Number.isFinite(s.startingPrice);
            const workLink = workLinkForCategory(s.category);
            const imagePriority = index === 0;

            return (
              <article
                key={s.id}
                className="group overflow-hidden rounded-[2rem] border bg-background transition-transform duration-300 hover:-translate-y-[2px]"
              >
                <Link href={`/services/${encodeURIComponent(s.slug)}`} className="block">
                  <div className="relative h-72 overflow-hidden bg-muted">
                    {img ? (
                      <Image
                        src={img}
                        alt={s.name || "Service"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        loading={imagePriority ? "eager" : "lazy"}
                        fetchPriority={imagePriority ? "high" : undefined}
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted to-background" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] tracking-[0.14em] text-white backdrop-blur">
                      {s.category.toUpperCase()}
                    </div>

                    {hasPrice ? (
                      <div className="absolute right-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white backdrop-blur">
                        From {s.currency} {s.startingPrice}
                      </div>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {s.name || "Service"}
                      </h2>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  {s.description ? (
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{s.description}</p>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Premium creative execution tailored to the tone and direction of your project.
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={`/services/${encodeURIComponent(s.slug)}`}
                      className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      View details
                    </Link>

                    <Link
                      href={`/contact?service=${encodeURIComponent(s.slug)}&category=${encodeURIComponent(s.category)}`}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                    >
                      Book
                    </Link>

                    <Link
                      href={workLink.href}
                      className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {workLink.label}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}