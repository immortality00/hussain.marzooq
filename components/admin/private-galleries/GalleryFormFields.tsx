"use client";

import { isExpiredLocalDateTime } from "./helpers";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";
import type { GalleryVisibility } from "./types";

type GalleryFormFieldsProps = {
  title: string;
  slug: string;
  description: string;
  visibility: GalleryVisibility;
  password: string;
  passwordRequired: boolean;
  canMakeNewLink: boolean;
  newLink: boolean;
  expiresAtLocal: string;
  isActive: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onVisibilityChange: (value: GalleryVisibility) => void;
  onPasswordChange: (value: string) => void;
  onNewLinkChange: (value: boolean) => void;
  onExpiresAtLocalChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
};

const VISIBILITY_OPTIONS: { value: GalleryVisibility; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

export function GalleryFormFields({
  title,
  slug,
  description,
  visibility,
  password,
  passwordRequired,
  canMakeNewLink,
  newLink,
  expiresAtLocal,
  isActive,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onVisibilityChange,
  onPasswordChange,
  onNewLinkChange,
  onExpiresAtLocalChange,
  onIsActiveChange,
}: GalleryFormFieldsProps) {
  const isExpired = isExpiredLocalDateTime(expiresAtLocal);

  return (
    <section className="rounded-[2rem] border p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className={adminInputClasses()}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            className={adminInputClasses()}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className={adminInputClasses("md", "min-h-28")}
          />
        </div>

        <fieldset className="space-y-2 md:col-span-2">
          <legend className="text-sm font-medium">Visibility</legend>
          <div className="flex flex-wrap gap-4 pt-1">
            {VISIBILITY_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gallery-visibility"
                  className={adminCheckboxClasses()}
                  checked={visibility === option.value}
                  onChange={() => onVisibilityChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {visibility === "private" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {passwordRequired ? "Password" : "New password (optional)"}
            </label>
            <input
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              className={adminInputClasses()}
            />
          </div>
        ) : canMakeNewLink ? (
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              className={adminCheckboxClasses()}
              checked={newLink}
              onChange={(event) => onNewLinkChange(event.target.checked)}
            />
            Make a new link
          </label>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Expiry</label>
            {isExpired ? (
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200">
                Expired
              </span>
            ) : null}
          </div>
          <input
            type="datetime-local"
            value={expiresAtLocal}
            onChange={(event) => onExpiresAtLocalChange(event.target.value)}
            className={adminInputClasses()}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className={adminCheckboxClasses()}
            checked={isActive}
            onChange={(event) => onIsActiveChange(event.target.checked)}
          />
          Active
        </label>
      </div>
    </section>
  );
}
