"use client";

import { UserRound } from "lucide-react";
import { TextField } from "@/components/admin/page-sections/fields";
import { adminInputClasses } from "@/components/admin/admin-input";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  SEARCH_PROFILE_LABELS,
  emailIsValid,
  linkIsValid,
  phoneIsValid,
  type SearchProfile,
  type SearchProfileTextField,
} from "@/lib/seo/search-profile";
import { GroupCard } from "./GroupCard";

type LinkRow = { url: string; shown: boolean };

function linkRows(profile: SearchProfile): LinkRow[] {
  const shown = new Set(profile.shownLinks);
  return profile.links.map((url) => ({ url, shown: shown.has(url) }));
}

export function SearchProfileGroup({
  profile,
  onChange,
}: {
  profile: SearchProfile;
  onChange: (profile: SearchProfile) => void;
}) {
  const field = (key: SearchProfileTextField, invalid = false) => (
    <TextField
      label={SEARCH_PROFILE_LABELS[key]}
      value={profile[key]}
      invalid={invalid}
      onChange={(value) => onChange({ ...profile, [key]: value })}
    />
  );

  return (
    <GroupCard icon={UserRound} label="Search profile" tint="seo">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("name")}
        {field("jobTitle")}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Profile links</p>
        <RepeatingListEditor<LinkRow>
          items={linkRows(profile)}
          onChange={(rows) =>
            onChange({
              ...profile,
              links: rows.map((row) => row.url),
              shownLinks: rows.filter((row) => row.shown).map((row) => row.url),
            })
          }
          makeNew={() => ({ url: "", shown: false })}
          addLabel="+ Add link"
          renderFields={(row, onItemChange) => (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="url"
                value={row.url}
                aria-label="Profile link"
                aria-invalid={!linkIsValid(row.url) || undefined}
                onChange={(e) => onItemChange({ ...row, url: e.target.value })}
                placeholder="https://www.instagram.com/…"
                className={adminInputClasses("md", "min-w-0 flex-1")}
              />
              <div className="flex shrink-0 items-center gap-2">
                <AdminToggle
                  checked={row.shown}
                  onChange={(shown) => onItemChange({ ...row, shown })}
                  label="Show on site"
                />
                <span className="w-12 text-xs text-muted-foreground">{row.shown ? "On site" : "Hidden"}</span>
              </div>
            </div>
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {field("city")}
        {field("country")}
        {field("email", !emailIsValid(profile.email))}
        {field("phone", !phoneIsValid(profile.phone))}
      </div>

      {field("areaServed")}

      <ImageField
        label="Portrait"
        value={profile.image}
        onChange={(image) => onChange({ ...profile, image })}
      />
    </GroupCard>
  );
}
