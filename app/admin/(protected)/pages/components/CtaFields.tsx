"use client";

import type { CtaCopy } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";

export function CtaFields({
  cta,
  onChange,
}: {
  cta: CtaCopy;
  onChange: (cta: CtaCopy) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Closing booking bar
      </p>
      <TextField label="Title" value={cta.title} onChange={(v) => onChange({ ...cta, title: v })} />
      <TextAreaField
        label="Description"
        rows={2}
        value={cta.description}
        onChange={(v) => onChange({ ...cta, description: v })}
      />
      <TextField
        label="Button label"
        value={cta.buttonLabel}
        onChange={(v) => onChange({ ...cta, buttonLabel: v })}
      />
    </div>
  );
}
