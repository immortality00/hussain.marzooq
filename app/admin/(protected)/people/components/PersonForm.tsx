"use client";

import Image from "next/image";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { adminInputClasses } from "@/components/admin/admin-input";
import { AvatarUploadField } from "@/components/shared/upload/AvatarUploadField";
import type { usePeopleAdmin } from "@/hooks/usePeopleAdmin";

type Admin = ReturnType<typeof usePeopleAdmin>;

function FormStatusNotice({
  visibility,
  removalApprovedAt,
}: {
  visibility: "public" | "private" | "hidden";
  removalApprovedAt: string | null;
}) {
  let text = "";
  if (removalApprovedAt) {
    text = `Removed on request (${removalApprovedAt.slice(0, 10)}). This profile is off the public site, its linked media are hidden, and it opens only with its password.`;
  } else if (visibility === "hidden") {
    text = "This profile is hidden — it is not listed and its direct link returns a 404.";
  } else if (visibility === "private") {
    text = "This profile is password-protected — hidden from the list and reachable only at its direct link with the password.";
  }

  if (!text) return null;

  return (
    <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-600 dark:text-amber-400">
      {text}
    </div>
  );
}

const VISIBILITY_OPTIONS: { value: "public" | "private" | "hidden"; label: string; hint: string }[] = [
  { value: "public", label: "Public", hint: "Listed on /people, content open to everyone." },
  { value: "private", label: "Password-protected", hint: "Hidden from the list; opens only with the password." },
  { value: "hidden", label: "Hidden", hint: "Not listed and the direct link returns a 404." },
];

export function PersonForm({ admin }: { admin: Admin }) {
  const { editingId, visibility, actionBusy } = admin;

  return (
    <section className="mt-8 mx-auto max-w-2xl rounded-[2rem] border p-5">
      <div className="text-sm font-medium">{editingId ? "Edit person" : "Create person"}</div>

      {editingId ? (
        <FormStatusNotice visibility={visibility} removalApprovedAt={admin.editingRemovalApprovedAt} />
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            value={admin.name}
            disabled={actionBusy}
            onChange={(e) => admin.setName(e.target.value)}
            className={adminInputClasses()}
            placeholder="Person name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={admin.slug}
            disabled={actionBusy}
            onChange={(e) => admin.setSlug(e.target.value)}
            className={adminInputClasses()}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar</label>

          <div className="flex flex-wrap gap-2">
            <AvatarUploadField
              folder={CLOUDINARY_PEOPLE_FOLDER}
              label="Upload avatar"
              disabled={actionBusy}
              onUploaded={admin.uploadAvatar}
            />

            <button
              type="button"
              disabled={actionBusy}
              onClick={admin.clearAvatar}
              className={adminButtonClasses("default", "md")}
            >
              Clear
            </button>
          </div>

          <input
            value={admin.avatarUrl}
            disabled={actionBusy}
            onChange={(e) => admin.setAvatarUrl(e.target.value)}
            className={adminInputClasses("md", "md:text-xs")}
            placeholder="Avatar URL"
          />

          {admin.avatarUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
              <Image src={admin.avatarUrl} alt="Avatar preview" fill className="object-cover" sizes="96px" />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={admin.bio}
            disabled={actionBusy}
            onChange={(e) => admin.setBio(e.target.value)}
            className={adminInputClasses("md", "h-32")}
            placeholder="Short public bio"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Visibility</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {VISIBILITY_OPTIONS.map((option) => {
              const active = visibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={actionBusy}
                  onClick={() => admin.setVisibility(option.value)}
                  aria-pressed={active}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors disabled:opacity-60 ${
                    active ? "border-foreground bg-foreground text-background" : "hover:bg-accent/40"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className={`mt-1 leading-4 ${active ? "text-background/70" : "text-muted-foreground"}`}>
                    {option.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {visibility === "private" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={admin.password}
              disabled={actionBusy}
              onChange={(e) => admin.setPassword(e.target.value)}
              autoComplete="new-password"
              className={adminInputClasses()}
              placeholder={
                admin.editingHasPassword ? "Leave blank to keep current password" : "Set a password (min 8 characters)"
              }
            />
            <p className="text-xs text-muted-foreground">
              {admin.editingHasPassword
                ? "A password is already set. Enter a new one only to change it."
                : "Anyone with this password can open the profile at its direct link."}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={admin.saving}
            onClick={() => void admin.save()}
            className={adminButtonClasses("solid", "md")}
          >
            {admin.saving ? (editingId ? "Updating…" : "Creating…") : editingId ? "Update" : "Create"}
          </button>

          <button
            type="button"
            disabled={actionBusy}
            onClick={admin.backToList}
            className={adminButtonClasses("default", "md")}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
