import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { PrivacySection } from "@/components/privacy/PrivacySection";
import { PROCESSORS, PRIVACY_SECTIONS } from "@/components/privacy/content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("privacy");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    path: "/privacy",
    image: seo.ogImageUrl,
  });
}

export default async function PrivacyPage() {
  const seo = await getPageSeo("privacy");

  return (
    <main className="section-shell pt-12 pb-12 sm:pt-16 sm:pb-16">
      <PageHeader title={seo.headerTitle} description={seo.headerDescription} />

      <div className="mt-8 space-y-10">
        {PRIVACY_SECTIONS.map((section) => (
          <PrivacySection key={section.heading} heading={section.heading} body={section.body} />
        ))}

        <section className="border-t border-border pt-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Services that process this data
          </h2>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-3 pr-4 font-normal">Service</th>
                  <th className="py-3 pr-4 font-normal">Purpose</th>
                  <th className="py-3 font-normal">Data it sees</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSORS.map((processor) => (
                  <tr key={processor.name} className="border-b border-border/60 align-top">
                    <td className="py-4 pr-4 font-medium">{processor.name}</td>
                    <td className="py-4 pr-4 leading-6 text-muted-foreground">
                      {processor.purpose}
                    </td>
                    <td className="py-4 leading-6 text-muted-foreground">{processor.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
