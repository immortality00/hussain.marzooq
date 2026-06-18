"use client";

import { GalleryFormFields } from "@/components/admin/private-galleries/GalleryFormFields";
import { GalleryList } from "@/components/admin/private-galleries/GalleryList";
import { PrivateGalleryMediaPicker } from "@/components/admin/private-galleries/PrivateGalleryMediaPicker";
import { usePrivateGalleriesAdmin } from "@/components/admin/private-galleries/usePrivateGalleriesAdmin";

export default function PrivateGalleriesAdminClient() {
  const admin = usePrivateGalleriesAdmin();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Private Galleries</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create password-protected galleries with secret links and selected media.
          </p>
        </div>

        {admin.view === "list" ? (
          <button
            type="button"
            onClick={admin.openNew}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            New gallery
          </button>
        ) : (
          <button
            type="button"
            onClick={admin.backToList}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Back to list
          </button>
        )}
      </div>

      {admin.banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            admin.banner.type === "ok"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {admin.banner.text}
        </div>
      ) : null}

      {admin.view === "list" ? (
        <GalleryList
          items={admin.items}
          loading={admin.loading}
          searchValue={admin.gallerySearchValue}
          onSearchChange={admin.setGallerySearchValue}
          onSearchClear={admin.clearGallerySearch}
          onCopyLink={(slug) => void admin.copyLink(slug)}
          onEdit={(id) => void admin.openEdit(id)}
          onDelete={(id) => void admin.remove(id)}
        />
      ) : (
        <section className="mt-8 space-y-6">
          <GalleryFormFields
            editing={Boolean(admin.editingId)}
            title={admin.title}
            slug={admin.slug}
            description={admin.description}
            password={admin.password}
            expiresAtLocal={admin.expiresAtLocal}
            isActive={admin.isActive}
            onTitleChange={admin.setTitle}
            onSlugChange={admin.setSlug}
            onDescriptionChange={admin.setDescription}
            onPasswordChange={admin.setPassword}
            onExpiresAtLocalChange={admin.setExpiresAtLocal}
            onIsActiveChange={admin.setIsActive}
          />

          <PrivateGalleryMediaPicker
            selectedMediaIds={admin.selectedMediaIds}
            onToggleMedia={admin.toggleMedia}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void admin.save()}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              {admin.editingId ? "Update gallery" : "Create gallery"}
            </button>

            <button
              type="button"
              onClick={admin.backToList}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </main>
  );
}