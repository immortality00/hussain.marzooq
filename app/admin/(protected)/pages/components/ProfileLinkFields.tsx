"use client";

import { adminInputClasses } from "@/components/admin/admin-input";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  OTHER_SITE,
  PROFILE_NETWORKS,
  profileLinkAddress,
  profileNetwork,
  shortAddress,
  withNetwork,
  type ProfileLinkKind,
  type ProfileLinkRow,
} from "@/lib/profile-links";

const FIELD = {
  name: { label: "Username", placeholder: "username", input: { type: "text", autoCapitalize: "none", autoCorrect: "off", spellCheck: false } },
  number: { label: "Phone number", placeholder: "+971 50 123 4567", input: { type: "tel", inputMode: "tel" } },
  link: { label: "Profile link", placeholder: "https://…", input: { type: "url" } },
} as const;

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function ProfileLinkFields({
  row,
  onChange,
}: {
  row: ProfileLinkRow;
  onChange: (row: ProfileLinkRow) => void;
}) {
  const field = FIELD[row.network === OTHER_SITE ? "link" : (profileNetwork(row.network)?.profile.field ?? "link")];
  const built = profileLinkAddress(row);
  const error = built && "error" in built ? built.error : null;
  const address = built && "address" in built && row.network !== OTHER_SITE ? built.address : null;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={row.network}
          aria-label="Network"
          onChange={(e) => onChange(withNetwork(row, e.target.value as ProfileLinkKind))}
          className={adminInputClasses("md", "sm:w-36 sm:shrink-0")}
        >
          {PROFILE_NETWORKS.map((network) => (
            <option key={network.key} value={network.key}>
              {network.label}
            </option>
          ))}
          <option value={OTHER_SITE}>Other site</option>
        </select>
        <input
          {...field.input}
          value={row.value}
          aria-label={field.label}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange({ ...row, value: e.target.value })}
          placeholder={field.placeholder}
          className={adminInputClasses("md", "min-w-0 flex-1")}
        />
        <div className="flex shrink-0 items-center gap-2">
          <AdminToggle checked={row.shown} onChange={(shown) => onChange({ ...row, shown })} label="Show on site" />
          <span className="w-12 text-xs text-muted-foreground">{row.shown ? "On site" : "Hidden"}</span>
        </div>
      </div>
      {error && <p className="text-xs text-destructive wrap-anywhere">{sentence(error)}</p>}
      {address && (
        <a
          href={address}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-muted-foreground wrap-anywhere hover:text-foreground"
        >
          {shortAddress(address)}
        </a>
      )}
    </div>
  );
}
