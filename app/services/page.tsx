import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const services = [
  { title: "Portrait Photography", href: "/services/portraits" },
  { title: "Fashion Photography", href: "/services/fashion" },
  { title: "Wedding Photography", href: "/services/weddings-photo" },
  { title: "Event Photography", href: "/services/events-photo" },
  { title: "Dance Films", href: "/services/dance-films" },
  { title: "Wedding Films", href: "/services/weddings-film" },
  { title: "Fashion Films", href: "/services/fashion-films" },
  { title: "Event Coverage", href: "/services/events-film" },
  { title: "Dance Teaching", href: "/services/dance-teaching" },
];

export default function ServicesPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Services</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Select a service to see highlights, deliverables, and how to book.
          (Pricing “starting from” will be optional and hidden when empty.)
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border p-5 hover:bg-accent/40 transition-colors"
            >
              <div className="text-base font-semibold">{s.title}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                View details →
              </div>
            </Link>
          ))}
        </div>
      </main>

      <StickyCta />
    </>
  );
}
