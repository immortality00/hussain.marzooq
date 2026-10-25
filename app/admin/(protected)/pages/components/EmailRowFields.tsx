"use client";

import { adminFieldShellClasses, adminInputClasses } from "@/components/admin/admin-input";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  EMAIL_LABEL_MAX,
  SITE_EMAIL_SUFFIX,
  localPartError,
  localPartOf,
  siteAddressOf,
  type EmailListItem,
} from "@/lib/email-list";

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function EmailRowFields({
  row,
  onChange,
}: {
  row: EmailListItem;
  onChange: (row: EmailListItem) => void;
}) {
  const name = localPartOf(row.address);
  const blank = !name.trim() && !row.label.trim();
  const error = blank ? null : localPartError(name);

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={row.label}
        maxLength={EMAIL_LABEL_MAX}
        aria-label="Label"
        placeholder="Label"
        onChange={(e) => onChange({ ...row, label: e.target.value })}
        className={adminInputClasses()}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className={adminFieldShellClasses("flex min-w-0 flex-1 overflow-hidden")}>
          <input
            type="text"
            value={name}
            aria-label="Address"
            aria-invalid={error ? true : undefined}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="name"
            onChange={(e) => onChange({ ...row, address: siteAddressOf(e.target.value) })}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none"
          />
          <span className="hidden items-center border-l px-3 text-muted-foreground sm:flex">{SITE_EMAIL_SUFFIX}</span>
        </div>
        <p className="text-xs text-muted-foreground wrap-anywhere sm:hidden">{`${name}${SITE_EMAIL_SUFFIX}`}</p>
        <div className="flex shrink-0 items-center gap-2">
          <AdminToggle checked={row.shown} onChange={(shown) => onChange({ ...row, shown })} label="Show on site" />
          <span className="w-12 text-xs text-muted-foreground">{row.shown ? "On site" : "Hidden"}</span>
        </div>
      </div>
      {error && <p className="text-xs text-destructive wrap-anywhere">{sentence(error)}</p>}
    </div>
  );
}
