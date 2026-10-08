"use client";

import { useSearchParams } from "next/navigation";
import { ContactForm } from "@/components/contact/ContactForm";
import type { ServiceItem } from "@/components/contact/types";

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
