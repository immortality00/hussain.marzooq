"use client";

import type { PageSectionsMap } from "@/lib/server/page-sections";
import { TextField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { CtaFields } from "./CtaFields";
import { adminInputClasses } from "@/components/admin/admin-input";

export function WebDevSectionsForm({
  data,
  onChange,
}: {
  data: PageSectionsMap["web-development"];
  onChange: (data: PageSectionsMap["web-development"]) => void;
}) {
  const { projects, stickyCta } = data;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Projects
        </p>
        <TextField
          label="Section heading"
          value={projects.heading}
          onChange={(v) => onChange({ ...data, projects: { ...projects, heading: v } })}
        />
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Project links — paste one project URL per row; the site preview is generated
            automatically
          </p>
          <RepeatingListEditor<string>
            items={projects.urls ?? []}
            onChange={(urls) => onChange({ ...data, projects: { ...projects, urls } })}
            makeNew={() => ""}
            addLabel="+ Add link"
            renderFields={(url, onItemChange) => (
              <input
                type="text"
                value={url}
                onChange={(e) => onItemChange(e.target.value)}
                placeholder="https://…"
                className={adminInputClasses()}
              />
            )}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <CtaFields cta={stickyCta} onChange={(cta) => onChange({ ...data, stickyCta: cta })} />
      </div>
    </div>
  );
}
