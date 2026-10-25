import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFromUrl } from "@/components/contact/ContactFromUrl";
import { getActiveServicesForContact } from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmailDirectory } from "@/components/shared/EmailDirectory";
import { getPageSeo } from "@/lib/server/page-seo";
import { getContactSections } from "@/lib/server/page-sections";
import { shownEmails } from "@/lib/email-list";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { cn } from "@/lib/utils";

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
  const [services, seo, contact] = await Promise.all([
    getActiveServicesForContact(),
    getPageSeo("contact"),
    getContactSections(),
  ]);
  const emails = shownEmails(contact.emails);
  const heading = typeof contact.heading === "string" ? contact.heading.trim() : "";

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <section className="rounded-[2.25rem] border bg-background/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
        />

        <div className="mt-10">
          <Suspense fallback={<ContactForm services={services} />}>
            <ContactFromUrl services={services} />
          </Suspense>
        </div>

        {emails.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            {heading && <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>}
            <EmailDirectory
              emails={emails}
              className={cn("grid gap-6 sm:grid-cols-2", heading && "mt-8")}
            />
          </div>
        )}
      </section>
    </main>
  );
}
