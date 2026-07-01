"use client";

import type { CtaOnlySections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";

export function CtaOnlyForm({
  data,
  onChange,
}: {
  data: CtaOnlySections;
  onChange: (data: CtaOnlySections) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Closing booking bar
      </p>
      <TextField
        label="Title"
        value={data.stickyCta.title}
        onChange={(v) => onChange({ stickyCta: { ...data.stickyCta, title: v } })}
      />
      <TextAreaField
        label="Description"
        rows={2}
        value={data.stickyCta.description}
        onChange={(v) => onChange({ stickyCta: { ...data.stickyCta, description: v } })}
      />
      <TextField
        label="Button label"
        value={data.stickyCta.buttonLabel}
        onChange={(v) => onChange({ stickyCta: { ...data.stickyCta, buttonLabel: v } })}
      />
    </div>
  );
}
