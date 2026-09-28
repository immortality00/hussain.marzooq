"use client";

import { isExpiredLocalDateTime } from "./helpers";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";

type GalleryFormFieldsProps = {
  editing: boolean;
  title: string;
  slug: string;
  description: string;
  password: string;
  expiresAtLocal: string;
  isActive: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onExpiresAtLocalChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
};

export function GalleryFormFields({
  editing,
  title,
  slug,
  description,
  password,
  expiresAtLocal,
  isActive,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onPasswordChange,
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

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {editing ? "New password (optional)" : "Password"}
          </label>
          <input
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            type="password"
            className={adminInputClasses()}
          />
        </div>

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