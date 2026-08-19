import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("dancing");
  return { title: seo.title, description: seo.description };
}

export default async function DancingPage() {
  const [{ isActive }, seo, content] = await Promise.all([
    getPageSettings("dancing"),
    getPageSeo("dancing"),
    getPageSections("dancing"),
  ]);
  if (!isActive) redirect("/");
  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {content.sections.map((item, i) => (
            <article
              key={i}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              {item.image?.url ? (
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl">
                  <SmartImage
                    src={item.image.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>
      </main>

      <StickyCta
        title={content.stickyCta.title}
        description={content.stickyCta.description}
        buttonLabel={content.stickyCta.buttonLabel}
      />
    </>
  );
}
