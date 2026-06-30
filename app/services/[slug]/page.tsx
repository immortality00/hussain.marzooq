import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/server/db";
import { workLinkForCategory } from "@/lib/server/public-services";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const revalidate = 300;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const db = await getDb();

  const doc = await db
    .collection("services")
    .findOne({ slug, isActive: true, isArchived: { $ne: true } });

  if (!doc) notFound();

  const name = typeof doc.name === "string" ? doc.name : "";
  const description =
    typeof doc.description === "string" ? doc.description : "";
  const imageUrl = typeof doc.imageUrl === "string" ? doc.imageUrl : "";
  const category = typeof doc.category === "string" ? doc.category : "others";
  const currency = typeof doc.currency === "string" ? doc.currency : "AED";
  const startingPrice =
    typeof doc.startingPrice === "number" ? doc.startingPrice : null;

  const workLink = workLinkForCategory(category);
  const pageSettings = await getAllPageSettings();
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));
  const workLinkActive = activeSet.has(workLink.href.replace("/", ""));

  return (
    <main className="section-shell py-12 sm:py-16">
      <Link
        href="/services"
        className="inline-flex text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to services
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] text-muted-foreground">
            {category.toUpperCase()}
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedText>{name}</AnimatedText>
            </h1>

            {startingPrice !== null ? (
              <div className="inline-flex rounded-full border px-4 py-2 text-sm text-muted-foreground">
                Starting from {currency} {startingPrice}
              </div>
            ) : null}
          </div>

          {description ? (
            <p className="max-w-xl whitespace-pre-wrap text-base leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/contact?service=${encodeURIComponent(slug)}&category=${encodeURIComponent(category)}`}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book this service
            </Link>

            {workLinkActive && (
              <Link
                href={workLink.href}
                className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                {workLink.label}
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border bg-muted">
          {imageUrl ? (
            <SmartImage
              src={imageUrl}
              alt={name}
              width={1600}
              height={1100}
              className="h-auto w-full object-cover"
              priority
            />
          ) : (
            <div className="min-h-[420px] bg-muted" />
          )}
        </div>
      </section>
    </main>
  );
}
