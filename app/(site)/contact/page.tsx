import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFromUrl, ContactSuccess } from "@/components/contact/ContactFromUrl";
import { getActiveServicesForContact } from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("contact");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    path: "/contact",
    image: seo.ogImageUrl,
  });
}

export default async function ContactPage() {
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

        <Suspense fallback={null}>
          <ContactSuccess />
        </Suspense>

        <div className="mt-10">
          <Suspense fallback={<ContactForm services={services} />}>
            <ContactFromUrl services={services} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
