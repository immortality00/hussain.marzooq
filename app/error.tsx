"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="section-shell flex min-h-[60vh] flex-col justify-center py-12 sm:py-16">
      <PageHeader
        title="Something went wrong"
        description="This page hit an error. Try again, or head back home."
        className="max-w-2xl"
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/">Back home</Button>
      </div>
    </main>
  );
}
