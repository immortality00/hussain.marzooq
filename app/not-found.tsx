import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-[60vh] flex-col justify-center py-12 sm:py-16">
      <PageHeader
        title="Page not found"
        description="This page has moved or never existed. The work is still here."
        className="max-w-2xl"
      />
      <div className="mt-8">
        <Button href="/">Back home</Button>
      </div>
    </main>
  );
}
