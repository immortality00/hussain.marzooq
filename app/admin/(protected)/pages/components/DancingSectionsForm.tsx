"use client";

import type { PageSectionsMap } from "@/lib/server/page-sections";
import { TextField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { CtaFields } from "./CtaFields";
import { adminInputClasses } from "@/components/admin/admin-input";

export function DancingSectionsForm({
  data,
  onChange,
}: {
  data: PageSectionsMap["dancing"];
  onChange: (data: PageSectionsMap["dancing"]) => void;
}) {
  const { instagram, stickyCta } = data;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Instagram
        </p>
        <TextField
          label="Section heading"
          value={instagram.heading}
          onChange={(v) => onChange({ ...data, instagram: { ...instagram, heading: v } })}
        />
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Post links — paste an Instagram post or reel URL per row
          </p>
          <RepeatingListEditor<string>
            items={instagram.urls}
            onChange={(urls) => onChange({ ...data, instagram: { ...instagram, urls } })}
            makeNew={() => ""}
            addLabel="+ Add post"
            renderFields={(url, onItemChange) => (
              <input
                type="text"
                value={url}
                onChange={(e) => onItemChange(e.target.value)}
                placeholder="https://www.instagram.com/p/…"
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
