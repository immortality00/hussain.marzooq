import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  startingPrice: number | null;
  currency: string;
  isActive: boolean;
  imageUrl: string;
  order: number;
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function safeNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function safeBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function extractItems<T>(json: unknown): T[] {
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (obj.ok === true && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

async function getBaseUrlFromHeaders(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function workLinkForCategory(categorySlug: string): { href: string; label: string } {
  const c = categorySlug.trim().toLowerCase();

  if (c.includes("photo")) return { href: "/photography", label: "See photos" };

  if (c.includes("video") || c.includes("film") || c.includes("reel")) {
    return { href: "/videography", label: "See videos" };
  }

  if (c.includes("dance")) return { href: "/dance", label: "See dance" };
  if (c.includes("nft")) return { href: "/nft", label: "See NFTs" };

  if (c.includes("web") || c.includes("dev") || c.includes("code")) {
    return { href: "/web-dev", label: "See web work" };
  }

  return { href: "/photography", label: "See my work" };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const selectedCategory = typeof sp.category === "string" ? sp.category : "all";

  const baseUrl = await getBaseUrlFromHeaders();

  const [servicesRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/api/services`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/service-categories`, { cache: "no-store" }),
  ]);

  const servicesJson = (await servicesRes.json().catch(() => null)) as unknown;
  const categoriesJson = (await categoriesRes.json().catch(() => null)) as unknown;

  const rawServices = extractItems<ServiceItem>(servicesJson);
  const rawCategories = extractItems<CategoryItem>(categoriesJson);

  const categories = rawCategories
    .filter((c) => safeBool(c.isActive, false))
    .sort((a, b) => (safeNumberOrNull(a.order) ?? 0) - (safeNumberOrNull(b.order) ?? 0));

  const servicesAll = rawServices
    .filter((s) => safeBool(s.isActive, true))
    .sort((a, b) => (safeNumberOrNull(a.order) ?? 0) - (safeNumberOrNull(b.order) ?? 0));

  const services =
    selectedCategory === "all"
      ? servicesAll
      : servicesAll.filter((s) => safeString(s.category).toLowerCase() === selectedCategory.toLowerCase());

  const tabs = [{ slug: "all", name: "All" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cinematic. Creative. Premium. Pick a service and book instantly — your request will be pre-filled.
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
            const img = safeString(s.imageUrl, "").trim();
            const hasPrice = typeof s.startingPrice === "number" && Number.isFinite(s.startingPrice);
            const workLink = workLinkForCategory(safeString(s.category, ""));

            return (
              <article key={s.id} className="group overflow-hidden rounded-2xl border bg-background">
                <div className="relative h-50 w-full overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={safeString(s.name, "Service")}
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

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold leading-tight">{safeString(s.name, "Service")}</h2>
                      <div className="mt-1 text-xs text-muted-foreground">{safeString(s.category, "").toUpperCase()}</div>
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

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={`/contact?service=${encodeURIComponent(s.slug)}&category=${encodeURIComponent(
                        safeString(s.category, "")
                      )}`}
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