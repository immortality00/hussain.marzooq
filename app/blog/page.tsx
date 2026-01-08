import { StickyCta } from "@/components/site/StickyCta";

export default function BlogPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          SEO content pillars (portraits, fashion, weddings, film, dance). We’ll
          publish articles that bring traffic and support your service pages.
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: Blog list goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
