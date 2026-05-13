import { ContactForm } from "@/components/contact/ContactForm";
import { getActiveServicesForContact } from "@/lib/server/public-services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = {
  success?: string;
  service?: string;
  category?: string;
  context?: string;
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const success = sp?.success === "1";
  const initialService = typeof sp?.service === "string" ? sp.service : "";
  const initialCategory = typeof sp?.category === "string" ? sp.category : "";
  const initialContextMessage = typeof sp?.context === "string" ? sp.context : "";

  const services = await getActiveServicesForContact();

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
          initialContextMessage={initialContextMessage}
        />
      </div>
    </main>
  );
}