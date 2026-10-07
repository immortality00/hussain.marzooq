"use client";

import { useSearchParams } from "next/navigation";
import { ContactForm } from "@/components/contact/ContactForm";
import type { ServiceItem } from "@/components/contact/types";

export function ContactSuccess() {
  if (useSearchParams().get("success") !== "1") return null;
  return (
    <div className="mt-8 rounded-2xl border bg-muted p-4 text-sm">
      ✅ Sent successfully. I&apos;ll get back to you soon.
    </div>
  );
}

export function ContactFromUrl({ services }: { services: ServiceItem[] }) {
  const params = useSearchParams();
  return (
    <ContactForm
      services={services}
      initialService={params.get("service") ?? ""}
      initialCategory={params.get("category") ?? ""}
      initialContextMessage={params.get("context") ?? ""}
    />
  );
}
