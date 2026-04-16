import clientPromise from "@/lib/mongodb";
import { ContactForm } from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = {
  success?: string;
  service?: string;   // can be: ObjectId OR slug OR name
  category?: string;
};

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  startingPrice: number | null;
  currency: string;
};

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

async function getActiveServices(): Promise<ServiceItem[]> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("services")
    .find({ isActive: true, isArchived: { $ne: true } })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  return docs.map((d) => ({
    id: String(d._id),
    name: asString(d.name) ?? "",
    slug: asString(d.slug) ?? "",
    category: asString(d.category) ?? "others",
    startingPrice: typeof d.startingPrice === "number" ? d.startingPrice : null,
    currency: asString(d.currency) ?? "AED",
  }));
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const success = sp?.success === "1";
  const initialService = typeof sp?.service === "string" ? sp.service : "";
  const initialCategory = typeof sp?.category === "string" ? sp.category : "";

  const services = await getActiveServices();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Contact / Booking</h1>
      <p className="mt-3 text-muted-foreground">
        Tell me what you want to create — I’ll reply with the best next step.
      </p>

      {success ? (
        <div className="mt-8 rounded-2xl border bg-muted p-4 text-sm">
          ✅ Sent successfully. I’ll get back to you soon.
        </div>
      ) : null}

      <div className="mt-10">
        <ContactForm
          services={services}
          initialService={initialService}
          initialCategory={initialCategory}
        />
      </div>
    </main>
  );
}