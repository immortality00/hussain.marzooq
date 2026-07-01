"use client";

import type { DancingSections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingCardListEditor";
import { RepeatingStringListEditor } from "@/components/admin/page-sections/RepeatingStringListEditor";

export function DancingSectionsForm({
  data,
  onChange,
}: {
  data: DancingSections;
  onChange: (data: DancingSections) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Movement language panel
        </p>
        <TextField
          label="Label"
          value={data.movementLanguage.label}
          onChange={(v) =>
            onChange({ ...data, movementLanguage: { ...data.movementLanguage, label: v } })
          }
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.movementLanguage.paragraph}
          onChange={(v) =>
            onChange({ ...data, movementLanguage: { ...data.movementLanguage, paragraph: v } })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Sections
        </p>
        <RepeatingCardListEditor
          items={data.sections}
          onChange={(items) => onChange({ ...data, sections: items })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Direction panel
        </p>
        <TextField
          label="Label"
          value={data.direction.label}
          onChange={(v) => onChange({ ...data, direction: { ...data.direction, label: v } })}
        />
        <TextField
          label="Heading"
          value={data.direction.heading}
          onChange={(v) => onChange({ ...data, direction: { ...data.direction, heading: v } })}
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.direction.paragraph}
          onChange={(v) => onChange({ ...data, direction: { ...data.direction, paragraph: v } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Work covered
        </p>
        <TextField
          label="Label"
          value={data.workCovered.label}
          onChange={(v) => onChange({ ...data, workCovered: { ...data.workCovered, label: v } })}
        />
        <RepeatingStringListEditor
          items={data.workCovered.items}
          onChange={(items) => onChange({ ...data, workCovered: { ...data.workCovered, items } })}
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
