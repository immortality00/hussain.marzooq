import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { getActiveServicesForContact } from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("contact");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    image: seo.ogImageUrl,
  });
}

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

  const [services, seo] = await Promise.all([
    getActiveServicesForContact(),
    getPageSeo("contact"),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <section className="rounded-[2.25rem] border bg-background/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
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
