"use client";

import { UserRound } from "lucide-react";
import { TextField } from "@/components/admin/page-sections/fields";
import { adminInputClasses } from "@/components/admin/admin-input";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import {
  SEARCH_PROFILE_LABELS,
  emailIsValid,
  linkIsValid,
  phoneIsValid,
  type SearchProfile,
  type SearchProfileTextField,
} from "@/lib/seo/search-profile";
import { GroupCard } from "./GroupCard";

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
        <RepeatingListEditor<string>
          items={profile.links}
          onChange={(links) => onChange({ ...profile, links })}
          makeNew={() => ""}
          addLabel="+ Add link"
          renderFields={(link, onItemChange) => (
            <input
              type="url"
              value={link}
              aria-label="Profile link"
              aria-invalid={!linkIsValid(link) || undefined}
              onChange={(e) => onItemChange(e.target.value)}
              placeholder="https://www.instagram.com/…"
              className={adminInputClasses()}
            />
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
