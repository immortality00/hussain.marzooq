"use client";

import type { PageSectionsMap } from "@/lib/server/page-sections";
import { TextField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { EMAIL_LIST_MAX, siteAddressOf, type EmailListItem } from "@/lib/email-list";
import { EmailRowFields } from "./EmailRowFields";

export function ContactSectionsForm({
  data,
  onChange,
}: {
  data: PageSectionsMap["contact"];
  onChange: (data: PageSectionsMap["contact"]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Email addresses</p>
      <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      <RepeatingListEditor<EmailListItem>
        items={data.emails}
        onChange={(emails) => onChange({ ...data, emails })}
        makeNew={() => ({ label: "", address: siteAddressOf(""), shown: true })}
        addLabel="+ Add address"
        max={EMAIL_LIST_MAX}
        renderFields={(row, onRowChange) => <EmailRowFields row={row} onChange={onRowChange} />}
      />
    </div>
  );
}
