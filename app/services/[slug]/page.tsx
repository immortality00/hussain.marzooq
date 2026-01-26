import Link from "next/link";
import Image from "next/image";
import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("services").findOne({ slug, isActive: true });
  if (!doc) notFound();

  const id = String(doc._id);
  const name = typeof doc.name === "string" ? doc.name : "";
  const description = typeof doc.description === "string" ? doc.description : "";
  const imageUrl = typeof doc.imageUrl === "string" ? doc.imageUrl : "";
  const currency = typeof doc.currency === "string" ? doc.currency : "AED";
  const startingPrice = typeof doc.startingPrice === "number" ? doc.startingPrice : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">{name}</h1>
          {startingPrice !== null && (
            <p className="mt-2 text-sm text-muted-foreground">
              Starting from {startingPrice} {currency}
            </p>
          )}
        </div>

        <Link
          href={`/contact?service=${encodeURIComponent(id)}`}
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Book this service
        </Link>
      </div>

      {imageUrl ? (
        <div className="mt-8 overflow-hidden rounded-2xl border">
          <Image
            src={imageUrl}
            alt={name}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="mt-8 prose prose-invert max-w-none">
        <p>{description}</p>
      </div>
    </main>
  );
}