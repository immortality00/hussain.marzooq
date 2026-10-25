"use client";

import type { PageSectionsMap } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { CtaFields } from "./CtaFields";

export function BlogSectionsForm({
  data,
  onChange,
}: {
  data: PageSectionsMap["blog"];
  onChange: (data: PageSectionsMap["blog"]) => void;
}) {
  const { subscribe, stickyCta } = data;
  const set = (field: keyof typeof subscribe) => (value: string) =>
    onChange({ ...data, subscribe: { ...subscribe, [field]: value } });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Subscribe form</p>
        <TextField label="Heading" value={subscribe.heading} onChange={set("heading")} />
        <TextAreaField label="Line" rows={2} value={subscribe.text} onChange={set("text")} />
        <TextField label="Button label" value={subscribe.buttonLabel} onChange={set("buttonLabel")} />
        <TextField label="Confirmation message" value={subscribe.confirmation} onChange={set("confirmation")} />
      </div>

      <div className="border-t pt-4">
        <CtaFields cta={stickyCta} onChange={(cta) => onChange({ ...data, stickyCta: cta })} />
      </div>
    </div>
  );
}
