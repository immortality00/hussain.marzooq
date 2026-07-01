"use client";

import type { BlogSections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingCardListEditor";

export function BlogSectionsForm({
  data,
  onChange,
}: {
  data: BlogSections;
  onChange: (data: BlogSections) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Editorial direction panel
        </p>
        <TextField
          label="Label"
          value={data.editorialDirection.label}
          onChange={(v) =>
            onChange({ ...data, editorialDirection: { ...data.editorialDirection, label: v } })
          }
        />
        <TextAreaField
          label="Paragraph"
          rows={3}
          value={data.editorialDirection.paragraph}
          onChange={(v) =>
            onChange({ ...data, editorialDirection: { ...data.editorialDirection, paragraph: v } })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Pillars
        </p>
        <RepeatingCardListEditor
          items={data.pillars}
          onChange={(items) => onChange({ ...data, pillars: items })}
        />
      </div>
    </div>
  );
}
