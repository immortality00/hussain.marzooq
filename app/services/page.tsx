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
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cinematic. Creative. Premium. Explore each service in detail, then book with your request pre-filled.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No services found for this category yet.
          </div>
        ) : (
          services.map((s) => {
            const img = s.imageUrl.trim();
            const hasPrice = typeof s.startingPrice === "number" && Number.isFinite(s.startingPrice);
            const workLink = workLinkForCategory(s.category);

            return (
              <article key={s.id} className="group overflow-hidden rounded-2xl border bg-background">
                <Link href={`/services/${encodeURIComponent(s.slug)}`} className="block">
                  <div className="relative h-50 w-full overflow-hidden">
                    {img ? (
                      <Image
                        src={img}
                        alt={s.name || "Service"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        priority={false}
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted to-background" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/70 via-background/0 to-background/0" />
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/services/${encodeURIComponent(s.slug)}`} className="hover:opacity-85 transition-opacity">
                        <h2 className="text-lg font-semibold leading-tight">{s.name || "Service"}</h2>
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">{s.category.toUpperCase()}</div>
                    </div>

                    {hasPrice ? (
                      <div className="shrink-0 rounded-full border px-3 py-1 text-xs">
                        From {s.currency} {s.startingPrice}
                      </div>
                    ) : null}
                  </div>

                  {s.description ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">Premium coverage tailored to your vision.</p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/services/${encodeURIComponent(s.slug)}`}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      View details
                    </Link>

                    <Link
                      href={`/contact?service=${encodeURIComponent(s.slug)}&category=${encodeURIComponent(s.category)}`}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                    >
                      Book
                    </Link>

                    <Link
                      href={workLink.href}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
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