import { ContactForm } from "@/components/contact/ContactForm";
import { getActiveServicesForContact } from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";

export const dynamic = "force-dynamic";

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
  const initialContextMessage =
    typeof sp?.context === "string" ? sp.context : "";

  const services = await getActiveServicesForContact();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <section className="rounded-[2.25rem] border bg-background/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <PageHeader
          title="Contact / Booking"
          description="Tell me what you want to create and I'll reply with the best direction for the project."
        />

        {success ? (
          <div className="mt-8 rounded-2xl border bg-muted p-4 text-sm">
            ✅ Sent successfully. I&apos;ll get back to you soon.
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
      </section>
    </main>
  );
}
