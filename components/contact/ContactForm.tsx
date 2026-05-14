"use client";

import ContactActions from "./ContactActions";
import ContactCategorySelector from "./ContactCategorySelector";
import ContactIdentityFields from "./ContactIdentityFields";
import ContactMessageField from "./ContactMessageField";
import ContactServiceSelector from "./ContactServiceSelector";
import type { ServiceItem } from "./types";
import { useContactFormState } from "./useContactFormState";

type Props = {
  services: ServiceItem[];
  initialService?: string;
  initialCategory?: string;
  initialContextMessage?: string;
};

export function ContactForm({
  services,
  initialService = "",
  initialCategory = "",
  initialContextMessage = "",
}: Props) {
  const form = useContactFormState({
    services,
    initialService,
    initialCategory,
    initialContextMessage,
  });

  return (
    <div className="rounded-2xl border p-6">
      {form.bookingBadge ? (
        <div className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Booking: {form.bookingBadge}
        </div>
      ) : null}

      {form.msg ? <div className="mb-4 text-sm text-muted-foreground">{form.msg}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <ContactIdentityFields
          name={form.name}
          setName={form.setName}
          email={form.email}
          setEmail={form.setEmail}
        />

        <ContactServiceSelector
          services={services}
          serviceMode={form.serviceMode}
          setModeSelect={form.setModeSelect}
          setModeOther={form.setModeOther}
          selectedServiceId={form.selectedServiceId}
          onSelectService={form.handleSelectService}
          otherService={form.otherService}
          setOtherService={form.setOtherService}
        />

        <ContactCategorySelector
          serviceMode={form.serviceMode}
          selectedService={form.selectedService}
          categoryMode={form.categoryMode}
          setCategoryMode={form.setCategoryMode}
          selectedCategory={form.selectedCategory}
          setSelectedCategory={form.setSelectedCategory}
          otherCategory={form.otherCategory}
          setOtherCategory={form.setOtherCategory}
          categories={form.categories}
        />

        <ContactMessageField
          message={form.message}
          setMessage={form.setMessage}
          contextMessage={form.lockedContextMessage}
        />
      </div>

      <ContactActions
        loading={form.loading}
        onSubmit={() => void form.submit()}
        onReset={form.resetForm}
      />
    </div>
  );
}