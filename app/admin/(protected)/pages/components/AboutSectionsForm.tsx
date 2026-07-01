"use client";

import type { AboutSections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingCardListEditor";
import { RepeatingStringListEditor } from "@/components/admin/page-sections/RepeatingStringListEditor";

export function AboutSectionsForm({
  data,
  onChange,
}: {
  data: AboutSections;
  onChange: (data: AboutSections) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Creative position panel
        </p>
        <TextField
          label="Label"
          value={data.creativePosition.label}
          onChange={(v) => onChange({ ...data, creativePosition: { ...data.creativePosition, label: v } })}
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.creativePosition.paragraph}
          onChange={(v) =>
            onChange({ ...data, creativePosition: { ...data.creativePosition, paragraph: v } })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Disciplines
        </p>
        <RepeatingCardListEditor
          items={data.disciplines}
          onChange={(items) => onChange({ ...data, disciplines: items })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Approach panel
        </p>
        <TextField
          label="Label"
          value={data.approach.label}
          onChange={(v) => onChange({ ...data, approach: { ...data.approach, label: v } })}
        />
        <TextField
          label="Heading"
          value={data.approach.heading}
          onChange={(v) => onChange({ ...data, approach: { ...data.approach, heading: v } })}
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.approach.paragraph}
          onChange={(v) => onChange({ ...data, approach: { ...data.approach, paragraph: v } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Principles
        </p>
        <TextField
          label="Label"
          value={data.principles.label}
          onChange={(v) => onChange({ ...data, principles: { ...data.principles, label: v } })}
        />
        <RepeatingStringListEditor
          items={data.principles.items}
          onChange={(items) => onChange({ ...data, principles: { ...data.principles, items } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Closing CTA panel
        </p>
        <TextField
          label="Label"
          value={data.closingCta.label}
          onChange={(v) => onChange({ ...data, closingCta: { ...data.closingCta, label: v } })}
        />
        <TextField
          label="Heading"
          value={data.closingCta.heading}
          onChange={(v) => onChange({ ...data, closingCta: { ...data.closingCta, heading: v } })}
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.closingCta.paragraph}
          onChange={(v) => onChange({ ...data, closingCta: { ...data.closingCta, paragraph: v } })}
        />
      </div>
    </div>
  );
}
