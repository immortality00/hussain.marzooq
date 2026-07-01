"use client";

import type { WebDevSections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingCardListEditor";
import { RepeatingStringListEditor } from "@/components/admin/page-sections/RepeatingStringListEditor";

export function WebDevSectionsForm({
  data,
  onChange,
}: {
  data: WebDevSections;
  onChange: (data: WebDevSections) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Creative technology panel
        </p>
        <TextField
          label="Label"
          value={data.creativeTechnology.label}
          onChange={(v) =>
            onChange({ ...data, creativeTechnology: { ...data.creativeTechnology, label: v } })
          }
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.creativeTechnology.paragraph}
          onChange={(v) =>
            onChange({ ...data, creativeTechnology: { ...data.creativeTechnology, paragraph: v } })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Capabilities
        </p>
        <RepeatingCardListEditor
          items={data.capabilities}
          onChange={(items) => onChange({ ...data, capabilities: items })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Technical direction panel
        </p>
        <TextField
          label="Label"
          value={data.technicalDirection.label}
          onChange={(v) =>
            onChange({ ...data, technicalDirection: { ...data.technicalDirection, label: v } })
          }
        />
        <TextField
          label="Heading"
          value={data.technicalDirection.heading}
          onChange={(v) =>
            onChange({ ...data, technicalDirection: { ...data.technicalDirection, heading: v } })
          }
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.technicalDirection.paragraph}
          onChange={(v) =>
            onChange({ ...data, technicalDirection: { ...data.technicalDirection, paragraph: v } })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Build principles
        </p>
        <TextField
          label="Label"
          value={data.buildPrinciples.label}
          onChange={(v) =>
            onChange({ ...data, buildPrinciples: { ...data.buildPrinciples, label: v } })
          }
        />
        <RepeatingStringListEditor
          items={data.buildPrinciples.items}
          onChange={(items) =>
            onChange({ ...data, buildPrinciples: { ...data.buildPrinciples, items } })
          }
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
