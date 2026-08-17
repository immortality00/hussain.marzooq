import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { PublicServiceItem } from "@/lib/server/public-services";
import type { HomeSections } from "@/lib/server/page-sections";

const serviceDirections = [
  { label: "Photography", slug: "photography" },
  { label: "Videography", slug: "videography" },
  { label: "Dance", slug: "dancing" },
  { label: "Creative Direction", slug: null },
  { label: "NFT / Web3", slug: "nft" },
  { label: "Web Development", slug: "web-development" },
];

function disciplineSlugForCategory(category: string): string | null {
  const c = category.trim().toLowerCase();
  if (c.includes("photo")) return "photography";
  if (c.includes("video") || c.includes("film") || c.includes("reel")) return "videography";
  if (c.includes("dance")) return "dancing";
  if (c.includes("nft")) return "nft";
  if (c.includes("web") || c.includes("dev") || c.includes("code")) return "web-development";
  return null;
}

export function HomeServicesPreview({
  services,
  activeSet,
  content,
}: {
  services: PublicServiceItem[];
  activeSet: Set<string>;
  content: HomeSections["servicesPreview"];
}) {
  const filteredServices = services.filter((s) => {
    const discipline = disciplineSlugForCategory(s.category);
    return discipline === null || activeSet.has(discipline);
  });

  const filteredDirections = serviceDirections.filter(
    (d) => d.slug === null || activeSet.has(d.slug),
  );

  // No panel wrapper: app/page.tsx places this and HomeCreativeSystem side by
  // side inside one shared section-shell grid. The heading sits directly on the
  // page (the card-in-card panel was removed in D2b), and the service cards
  // stack in a single column instead of a 3-column row.
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.heading}</h2>

      <div className="mt-8 grid gap-6">
        {filteredServices.length
          ? filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} activeSet={activeSet} preview />
            ))
          : filteredDirections.map((item) => (
              <Link
                key={item.label}
                href="/services"
                className="rounded-[2rem] border bg-background/60 p-5 text-sm font-medium hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
      </div>

      <Button href="/services" className="mt-8">
        View services
      </Button>
    </div>
  );
}
