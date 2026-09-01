"use client";

import Image from "next/image";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { usePeopleAdmin } from "@/hooks/usePeopleAdmin";
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";

function statusLabel(item: { isPublic: boolean; isPrivate: boolean }) {
  if (item.isPublic === false) return "Hidden";
  if (item.isPrivate) return "Password-protected";
  return "Public";
}

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

export default function PeopleAdminClient() {
  const {
    items,
    loading,
    saving,
    deletingId,
    actionBusy,
    banner,
    mode,
    editingId,
    query,
    name,
    slug,
    bio,
    avatarUrl,
    visibility,
    password,
    editingHasPassword,
    editingRemovalApprovedAt,
    setQuery,
    setName,
    setSlug,
    setBio,
    setAvatarUrl,
    setVisibility,
    setPassword,
    openCreate,
    openEdit,
    backToList,
    save,
    remove,
    bulkBusy,
    bulkRemove,
  } = usePeopleAdmin();

  const selection = useBulkSelection(items.map((p) => p.id));

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="People"
        actions={
          mode === "list" ? (
            <button
              type="button"
              disabled={actionBusy}
              onClick={openCreate}
              className={adminButtonClasses("default", "md")}
            >
              New profile
            </button>
          ) : (
            <button
              type="button"
              disabled={actionBusy}
              onClick={backToList}
              className={adminButtonClasses("default", "md")}
            >
              Back to list
            </button>
          )
        }
      />

      <AdminActionFeedback feedback={banner} />

      {mode === "list" ? (
        <section className="mt-8 rounded-[2rem] border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Profiles</div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {items.length > 0 && (
            <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
              <BulkCheckbox
                checked={selection.allSelected}
                indeterminate={selection.count > 0 && !selection.allSelected}
                onChange={selection.toggleAll}
                label="Select all profiles"
              />
              Select all
            </div>
          )}

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No profiles yet.</div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="rounded-[2rem] border p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <BulkCheckbox
                      checked={selection.isSelected(item.id)}
                      onChange={() => selection.toggle(item.id)}
                      label={`Select ${item.name}`}
                    />
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-muted">
                      {item.avatarUrl ? (
                        <Image src={item.avatarUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{item.name}</span>
                        {item.removalRequestedAt ? (
                          <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
                            Removal requested
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        /people/{item.slug} • {statusLabel(item)}
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => openEdit(item)}
                        className={adminButtonClasses("default", "md")}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => void remove(item.id)}
                        className={adminButtonClasses("danger", "md")}
                      >
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <BulkActionBar
            count={selection.count}
            busy={bulkBusy}
            onClear={selection.clear}
            actions={[
              {
                label: "Delete",
                tone: "danger",
                onRun: async () => {
                  await bulkRemove(selection.selectedIds);
                  selection.clear();
                },
              },
            ]}
          />
        </section>
      ) : (
        <section className="mt-8 mx-auto max-w-2xl rounded-[2rem] border p-5">
          <div className="text-sm font-medium">{editingId ? "Edit person" : "Create person"}</div>

          {editingId ? <FormStatusNotice visibility={visibility} removalApprovedAt={editingRemovalApprovedAt} /> : null}

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                value={name}
                disabled={actionBusy}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Person name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                value={slug}
                disabled={actionBusy}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>

              <div className="flex flex-wrap gap-2">
                <CloudinaryUploadButton
                  folder={CLOUDINARY_PEOPLE_FOLDER}
                  accept="image/*"
                  label="Upload avatar"
                  disabled={actionBusy}
                  onUploaded={(u) => setAvatarUrl(u.secureUrl)}
                />

                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => setAvatarUrl("")}
                  className={adminButtonClasses("default", "md")}
                >
                  Clear
                </button>
              </div>

              <input
                value={avatarUrl}
                disabled={actionBusy}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Avatar URL"
              />

              {avatarUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
                  <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" sizes="96px" />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                disabled={actionBusy}
                onChange={(e) => setBio(e.target.value)}
                className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
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
                      onClick={() => setVisibility(option.value)}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors disabled:opacity-60 ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "hover:bg-accent/40"
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
                  value={password}
                  disabled={actionBusy}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  placeholder={editingHasPassword ? "Leave blank to keep current password" : "Set a password (min 8 characters)"}
                />
                <p className="text-xs text-muted-foreground">
                  {editingHasPassword
                    ? "A password is already set. Enter a new one only to change it."
                    : "Anyone with this password can open the profile at its direct link."}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className={adminButtonClasses("solid", "md")}
              >
                {saving ? (editingId ? "Updating…" : "Creating…") : editingId ? "Update" : "Create"}
              </button>

              <button
                type="button"
                disabled={actionBusy}
                onClick={backToList}
                className={adminButtonClasses("default", "md")}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
