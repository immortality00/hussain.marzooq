"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { usePeopleAdmin } from "@/hooks/usePeopleAdmin";

type WidgetResult = { info?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

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
    isPublic,
    setQuery,
    setName,
    setSlug,
    setBio,
    setAvatarUrl,
    setIsPublic,
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
    <main className="mx-auto max-w-6xl px-6 py-10">
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
                  <div className="flex items-center gap-4">
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
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        /people/{item.slug} • {item.isPublic ? "Public" : "Private"}
                      </div>
                    </div>

                    <div className="flex gap-2">
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
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  options={{ folder: CLOUDINARY_PEOPLE_FOLDER, multiple: false, resourceType: "image" }}
                  onSuccess={(result: unknown) => {
                    const r = result as WidgetResult;
                    const info = r?.info;
                    if (!isRecord(info)) return;
                    const secureUrl = getString(info.secure_url);
                    if (secureUrl) setAvatarUrl(secureUrl);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => open()}
                      className={adminButtonClasses("default", "md")}
                    >
                      Upload avatar
                    </button>
                  )}
                </CldUploadWidget>

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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                disabled={actionBusy}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public profile
            </label>

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
