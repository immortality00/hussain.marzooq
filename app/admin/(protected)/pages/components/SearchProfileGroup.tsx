"use client";

import { UserRound } from "lucide-react";
import { TextField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import {
  SEARCH_PROFILE_LABELS,
  emailIsValid,
  normalizeSearchProfile,
  phoneIsValid,
  type SearchProfile,
  type SearchProfileDraft,
  type SearchProfileTextField,
} from "@/lib/seo/search-profile";
import { PROFILE_NETWORKS, profileLinkRows, type ProfileLinkRow } from "@/lib/profile-links";
import { GroupCard } from "./GroupCard";
import { ProfileLinkFields } from "./ProfileLinkFields";

// The rows being edited, else the stored links read back as rows.
function linkRowsOf(draft: unknown, profile: SearchProfile): ProfileLinkRow[] {
  const rows = (draft as SearchProfileDraft | undefined)?.linkRows;
  return Array.isArray(rows) ? rows : profileLinkRows(profile);
}

export function SearchProfileGroup({
  draft,
  onChange,
}: {
  draft: unknown;
  onChange: (profile: SearchProfileDraft) => void;
}) {
  const profile = normalizeSearchProfile(draft);
  const rows = linkRowsOf(draft, profile);
  // Every change carries the rows, so the save builds the links from them.
  const update = (next: SearchProfile, linkRows = rows) => onChange({ ...next, linkRows });

  const field = (key: SearchProfileTextField, invalid = false) => (
    <TextField
      label={SEARCH_PROFILE_LABELS[key]}
      value={profile[key]}
      invalid={invalid}
      onChange={(value) => update({ ...profile, [key]: value })}
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
        <RepeatingListEditor<ProfileLinkRow>
          items={rows}
          onChange={(next) => update(profile, next)}
          makeNew={() => ({ network: PROFILE_NETWORKS[0]!.key, value: "", shown: false })}
          addLabel="+ Add link"
          renderFields={(row, onItemChange) => <ProfileLinkFields row={row} onChange={onItemChange} />}
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
        onChange={(image) => update({ ...profile, image })}
      />
    </GroupCard>
  );
}
